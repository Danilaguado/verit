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
    return response.status(200).json(await tokenRes.json());
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
    // 1. Pega IDs do highlights
    const highlightRes = await fetch(
      `https://api.mercadolibre.com/highlights/MLB/category/${targetCat}`,
      { headers },
    );
    const highlightData = await highlightRes.json();
    const productIds = (highlightData.content || [])
      .slice(0, 20)
      .map((i) => i.id);

    if (!productIds.length) {
      return response.status(200).json({ results: [] });
    }

    // 2. Para cada produto busca detalhes + melhor item com preço
    const results = await Promise.all(
      productIds.map(async (pid) => {
        const [prodRes, itemsRes] = await Promise.all([
          fetch(`https://api.mercadolibre.com/products/${pid}`, {
            headers,
          }).then((r) => r.json()),
          fetch(`https://api.mercadolibre.com/products/${pid}/items?limit=1`, {
            headers,
          }).then((r) => r.json()),
        ]);

        const item = itemsRes?.results?.[0] ?? null;
        const price = item?.price ?? null;
        const original_price = item?.original_price ?? null;
        const itemId = item?.item_id ?? null;

        // Permalink correto: usa o product page do ML
        const permalink = `https://www.mercadolivre.com.br/p/${pid}`;

        return {
          id: pid,
          title: prodRes.name || prodRes.title || "",
          price,
          original_price,
          thumbnail: prodRes.pictures?.[0]?.url ?? null,
          permalink,
        };
      }),
    );

    return response
      .status(200)
      .json({ results: results.filter((p) => p.title) });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
