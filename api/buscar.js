export default async function handler(request, response) {
  // 1. Recibir parámetros de la petición
  const categoria = request.query.categoria;

  if (!categoria) {
    return response.status(400).json({ error: "Falta la categoría" });
  }

  // 2. Leer las credenciales de entorno de Vercel (Seguro)
  const APP_ID = process.env.APP_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;

  if (!APP_ID || !CLIENT_SECRET) {
    return response
      .status(500)
      .json({ error: "Faltan las variables de entorno en Vercel" });
  }

  try {
    // 3. Generar el Token de acceso de ML
    const tokenParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: APP_ID,
      client_secret: CLIENT_SECRET,
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
      throw new Error("No se pudo obtener el token de Mercado Libre");
    }

    // 4. Buscar productos con el token en los headers
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?category=${categoria}&limit=20&sort=relevance`;
    const mlReq = await fetch(mlUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    const mlData = await mlReq.json();

    // 5. Devolver resultados al Frontend
    return response.status(200).json(mlData);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
