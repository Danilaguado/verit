export default async function handler(request, response) {
  const { categoria } = request.query;

  // ─── CONFIGURAÇÃO ─────────────────────────────────────────
  const APP_ID = process.env.APP_ID || "3303067719048967";
  const CLIENT_SECRET =
    process.env.CLIENT_SECRET || "Fwm0jA6sQPX8AflQlFYRJ3xSGtjJ9Hzh";
  const REDIRECT_URI = "https://verit-orpin.vercel.app/";
  const REFRESH_TOKEN = "TG-69bf5f89b550e700010bee8c-1846550535";
  // ──────────────────────────────────────────────────────────

  try {
    // 1. Usa o refresh_token para gerar um access_token fresco
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: APP_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("Token response:", JSON.stringify(tokenData).substring(0, 200));

    if (!tokenData.access_token) {
      return response.status(401).json({
        error: "Falha ao renovar token",
        detalhes: tokenData,
      });
    }

    // 2. Busca produtos da categoria
    const targetCat = categoria || "MLB1144";
    const mlRes = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20&sort=relevance`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      },
    );

    const data = await mlRes.json();

    if (data.error || data.status === 403) {
      return response.status(mlRes.status).json({
        error: data.error || data.message,
        detalhes: data,
      });
    }

    return response.status(200).json(data);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
