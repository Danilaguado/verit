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

  // Busca normal usando ML_ACCESS_TOKEN
  const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return response
      .status(401)
      .json({ error: "ML_ACCESS_TOKEN não configurado." });
  }

  const targetCat = categoria || "MLB1144";
  const mlRes = await fetch(
    `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20&sort=relevance`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
  );
  const data = await mlRes.json();
  return response.status(mlRes.status).json(data);
}
