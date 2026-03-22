export default async function handler(request, response) {
  const { categoria, code } = request.query;

  const APP_ID = process.env.APP_ID || "3303067719048967";
  const CLIENT_SECRET =
    process.env.CLIENT_SECRET || "Fwm0jA6sQPX8AflQlFYRJ3xSGtjJ9Hzh";
  const REDIRECT_URI = "https://verit-orpin.vercel.app/";

  if (code) {
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: APP_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    return response.status(200).json(tokenData);
  }

  const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return response
      .status(401)
      .json({ error: "ML_ACCESS_TOKEN não configurado." });
  }

  const targetCat = categoria || "MLB1144";
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  };

  try {
    // Pega IDs do highlights
    const highlightRes = await fetch(
      `https://api.mercadolibre.com/highlights/MLB/category/${targetCat}`,
      { headers },
    );
    const highlightData = await highlightRes.json();
    const ids = (highlightData.content || []).slice(0, 20).map((i) => i.id);

    if (!ids.length) {
      return response
        .status(200)
        .json({ error: "Highlights sem IDs", raw: highlightData });
    }

    // Testa 3 formas de buscar os detalhes
    const url1 = `https://api.mercadolibre.com/items?ids=${ids.join(",")}&attributes=id,title,price,original_price,thumbnail,permalink`;
    const url2 = `https://api.mercadolibre.com/items/${ids[0]}`;
    const url3 = `https://api.mercadolibre.com/items/${ids[0]}?access_token=${ACCESS_TOKEN}`;

    const [r1, r2, r3] = await Promise.all([
      fetch(url1, { headers }).then(async (r) => ({
        status: r.status,
        body: await r.text(),
      })),
      fetch(url2, { headers }).then(async (r) => ({
        status: r.status,
        body: await r.text(),
      })),
      fetch(url3).then(async (r) => ({
        status: r.status,
        body: await r.text(),
      })),
    ]);

    return response.status(200).json({
      ids_encontrados: ids,
      multiget: { status: r1.status, sample: r1.body.substring(0, 300) },
      item_unico_header: {
        status: r2.status,
        sample: r2.body.substring(0, 300),
      },
      item_unico_queryparam: {
        status: r3.status,
        sample: r3.body.substring(0, 300),
      },
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
