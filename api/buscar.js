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
    // Pega IDs do highlights (são product IDs)
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

    // Busca cada produto via /products/:id — retorna listings (itens à venda)
    const productResults = await Promise.all(
      productIds.map((pid) =>
        fetch(`https://api.mercadolibre.com/products/${pid}`, { headers })
          .then((r) => r.json())
          .catch(() => null),
      ),
    );

    const results = productResults
      .filter((p) => p && !p.error && p.id)
      .map((p) => ({
        id: p.id,
        title: p.name || p.title,
        price: p.buy_box_winner?.price ?? null,
        original_price: p.buy_box_winner?.original_price ?? null,
        thumbnail: p.pictures?.[0]?.url ?? p.thumbnail ?? null,
        permalink: `https://www.mercadolivre.com.br/p/${p.id}`,
        condition: p.buy_box_winner?.condition ?? null,
      }));

    return response.status(200).json({ results });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
