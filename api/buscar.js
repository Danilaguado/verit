export default async function handler(request, response) {
  const { categoria, code } = request.query;

  // Credenciales de tu App
  const APP_ID = process.env.APP_ID || "3303067719048967";
  const CLIENT_SECRET =
    process.env.CLIENT_SECRET || "Fwm0jA6sQPX8AflQlFYRJ3xSGtjJ9Hzh";
  const REDIRECT_URI = "https://verit-orpin.vercel.app/";

  try {
    let accessToken = "";

    // SI HAY UN CÓDIGO EN LA URL (?code=TG-...), lo canjeamos en el momento
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
      accessToken = tokenData.access_token;
    }

    // Si no hay acceso, no podemos continuar
    if (!accessToken) {
      return response.status(401).json({
        error:
          "No hay token de acceso. Por favor, autoriza la aplicación primero.",
        ayuda: "Usa el enlace de autorización para generar un nuevo ?code=",
      });
    }

    // BUSCAMOS LOS PRODUCTOS
    const targetCat = categoria || "MLB1144";
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20`;

    const mlRes = await fetch(mlUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = await mlRes.json();
    return response.status(200).json(data);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
