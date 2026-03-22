export default async function handler(request, response) {
  const { categoria, code, debug } = request.query;

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

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  };
  const pid = "MLB50196682"; // produto fixo para diagnóstico

  // Testa todos os endpoints possíveis para pegar preço
  const tests = await Promise.all([
    fetch(`https://api.mercadolibre.com/products/${pid}/items?limit=1`, {
      headers,
    }).then(async (r) => ({
      ep: "products/items",
      status: r.status,
      body: (await r.text()).substring(0, 300),
    })),
    fetch(
      `https://api.mercadolibre.com/sites/MLB/search?catalog_product_id=${pid}&limit=1`,
      { headers },
    ).then(async (r) => ({
      ep: "search by catalog_product_id",
      status: r.status,
      body: (await r.text()).substring(0, 300),
    })),
    fetch(`https://api.mercadolibre.com/products/${pid}`, { headers }).then(
      async (r) => ({
        ep: "products detail",
        status: r.status,
        body: (await r.text()).substring(0, 500),
      }),
    ),
  ]);

  return response.status(200).json({ diagnostico: tests });
}
