export default async function handler(request, response) {
  const { categoria, code } = request.query;

  const APP_ID = process.env.APP_ID || "3303067719048967";
  const CLIENT_SECRET =
    process.env.CLIENT_SECRET || "Fwm0jA6sQPX8AflQlFYRJ3xSGtjJ9Hzh";
  const REDIRECT_URI = "https://verit-orpin.vercel.app/";

  // Rota de troca: /api/buscar?code=TG-...
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

  // Testa 3 endpoints diferentes para achar um que funcione
  const endpoints = [
    // 1. Search padrão com filtro de desconto
    `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20&sort=relevance&discount=10-100`,
    // 2. Search sem filtro
    `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20`,
    // 3. Highlights (produtos em destaque)
    `https://api.mercadolibre.com/highlights/MLB/category/${targetCat}`,
  ];

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  };

  const results = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      results.push({
        url,
        status: res.status,
        error: data.error || data.message || null,
        total: data.paging?.total ?? (Array.isArray(data) ? data.length : null),
        sample: JSON.stringify(data).substring(0, 200),
      });
      // Se funcionou, retorna os dados reais
      if (res.status === 200 && (data.results?.length || Array.isArray(data))) {
        return response.status(200).json(data);
      }
    } catch (e) {
      results.push({ url, error: e.message });
    }
  }

  // Se todos falharam, retorna o diagnóstico
  return response.status(403).json({
    error: "Todos os endpoints retornaram erro. Veja o diagnóstico abaixo.",
    diagnostico: results,
  });
}
