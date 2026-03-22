export default async function handler(request, response) {
  const { categoria, tipo, code } = request.query;

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
  const authHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };
  const pubHeaders = { Accept: "application/json" }; // sem token

  const targetCat = categoria || "MLB1144";

  // Testa 4 URLs e retorna diagnóstico completo
  const tests = [
    {
      label: "search COM token",
      url: `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=5`,
      headers: authHeaders,
    },
    {
      label: "search SEM token",
      url: `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=5`,
      headers: pubHeaders,
    },
    {
      label: "search ofertas COM token",
      url: `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&discount=10-100&limit=5`,
      headers: authHeaders,
    },
    {
      label: "search relampago COM token",
      url: `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&promotion_type=lightning&limit=5`,
      headers: authHeaders,
    },
  ];

  const results = await Promise.all(
    tests.map(async (t) => {
      try {
        const res = await fetch(t.url, { headers: t.headers });
        const text = await res.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }
        return {
          label: t.label,
          status: res.status,
          total: parsed?.paging?.total ?? null,
          results_count: parsed?.results?.length ?? null,
          error: parsed?.error || parsed?.message || null,
          sample: text.substring(0, 200),
        };
      } catch (e) {
        return { label: t.label, error: e.message };
      }
    }),
  );

  return response.status(200).json({ diagnostico: results });
}
