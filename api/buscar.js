export default async function handler(request, response) {
  const categoria = request.query.categoria;

  if (!categoria) {
    return response.status(400).json({ error: "Falta la categoria" });
  }

  const APP_ID = process.env.APP_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  try {
    // 1. Vercel pide un token de acceso fresco usando tu Refresh Token
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

    if (!tokenData.access_token) {
      throw new Error(
        "No se pudo renovar el token. Revisa tus credenciales en Vercel.",
      );
    }

    // 2. Vercel busca los productos con el token recién horneado
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?category=${categoria}&limit=20&sort=relevance`;
    const mlReq = await fetch(mlUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    const mlData = await mlReq.json();

    // 3. Vercel te devuelve las ofertas a tu página
    return response.status(200).json(mlData);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
