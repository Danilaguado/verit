export default async function handler(request, response) {
  const categoria = request.query.categoria;

  if (!categoria) {
    return response.status(400).json({ error: "Falta la categoria" });
  }

  const APP_ID = process.env.APP_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  // 1. Diagnóstico: Verificamos si Vercel sí está cargando las variables
  if (!APP_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return response.status(500).json({
      error: "Vercel no está leyendo las variables de entorno",
      variables_leidas: {
        APP_ID_existe: !!APP_ID,
        CLIENT_SECRET_existe: !!CLIENT_SECRET,
        REFRESH_TOKEN_existe: !!REFRESH_TOKEN,
      },
    });
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: APP_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    });

    const tokenReq = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenReq.json();

    // 2. Diagnóstico: Mostramos el error EXACTO que devuelve Mercado Libre
    if (!tokenData.access_token) {
      return response.status(400).json({
        error: "Mercado Libre rechazó la petición",
        respuesta_oficial_ml: tokenData,
      });
    }

    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?category=${categoria}&limit=20&sort=relevance`;
    const mlReq = await fetch(mlUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    const mlData = await mlReq.json();

    return response.status(200).json(mlData);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
