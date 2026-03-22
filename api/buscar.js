export default async function handler(request, response) {
  const { categoria } = request.query;

  // ─── CONFIGURAÇÃO ─────────────────────────────────────────
  const APP_ID = process.env.APP_ID || "3303067719048967";
  const CLIENT_SECRET =
    process.env.CLIENT_SECRET || "Fwm0jA6sQPX8AflQlFYRJ3xSGtjJ9Hzh";
  // ──────────────────────────────────────────────────────────

  try {
    // 1. Gera token com client_credentials (sem precisar de login do usuário)
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: APP_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return response.status(401).json({
        error: "Falha ao gerar token",
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
