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
    // 1. Pega os IDs dos produtos em destaque da categoria
    const highlightRes = await fetch(
      `https://api.mercadolibre.com/highlights/MLB/category/${targetCat}`,
      { headers },
    );
    const highlightData = await highlightRes.json();
    const ids = (highlightData.content || []).slice(0, 20).map((i) => i.id);

    if (!ids.length) {
      return response.status(200).json({ results: [] });
    }

    // 2. Busca detalhes de todos os IDs de uma vez (endpoint multiget)
    const itemsRes = await fetch(
      `https://api.mercadolibre.com/items?ids=${ids.join(",")}&attributes=id,title,price,original_price,thumbnail,permalink,condition`,
      { headers },
    );
    const itemsData = await itemsRes.json();

    // itemsData é um array de { code, body } — extrai só os que vieram OK
    const results = itemsData.filter((i) => i.code === 200).map((i) => i.body);

    return response.status(200).json({ results });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
