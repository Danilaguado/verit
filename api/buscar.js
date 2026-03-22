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
  const headers = { Accept: "application/json" };
  if (ACCESS_TOKEN) headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;

  const targetCat = categoria || "MLB1144";

  try {
    // Tenta search direto server-side (sem CORS, pode funcionar sem auth)
    const searchUrl = tipo
      ? buildOfertaUrl(tipo)
      : `https://api.mercadolibre.com/sites/MLB/search?category=${targetCat}&limit=20&sort=relevance`;

    const res = await fetch(searchUrl, { headers });
    const data = await res.json();

    // Se search funcionou, retorna direto
    if (res.ok && data.results && data.results.length > 0) {
      return response.status(200).json({
        results: data.results.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          original_price: p.original_price,
          thumbnail: p.thumbnail,
          permalink: p.permalink,
        })),
      });
    }

    // Fallback: highlights por categoria
    const results = await getHighlights(targetCat, headers);
    return response.status(200).json({ results });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}

function buildOfertaUrl(tipo) {
  const base =
    "https://api.mercadolibre.com/sites/MLB/search?limit=20&sort=relevance";
  if (tipo === "relampago") return base + "&promotion_type=lightning";
  if (tipo === "imbativeis") return base + "&promotion_type=deal_of_the_day";
  return base + "&discount=10-100"; // todas as ofertas
}

async function getHighlights(catId, headers) {
  const ids = new Set();

  const res = await fetch(
    `https://api.mercadolibre.com/highlights/MLB/category/${catId}`,
    { headers },
  );
  if (res.ok) {
    const data = await res.json();
    (data.content || []).forEach((i) => ids.add(i.id));
  }

  if (ids.size < 20) {
    const catRes = await fetch(
      `https://api.mercadolibre.com/categories/${catId}`,
      { headers },
    );
    if (catRes.ok) {
      const catData = await catRes.json();
      for (const child of catData.children_categories || []) {
        if (ids.size >= 20) break;
        const subRes = await fetch(
          `https://api.mercadolibre.com/highlights/MLB/category/${child.id}`,
          { headers },
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          (subData.content || []).forEach((i) => ids.add(i.id));
        }
      }
    }
  }

  const productIds = [...ids].slice(0, 20);
  if (!productIds.length) return [];

  const results = await Promise.all(
    productIds.map(async (pid) => {
      try {
        const [prodRes, itemsRes] = await Promise.all([
          fetch(`https://api.mercadolibre.com/products/${pid}`, {
            headers,
          }).then((r) => r.json()),
          fetch(`https://api.mercadolibre.com/products/${pid}/items?limit=1`, {
            headers,
          }).then((r) => r.json()),
        ]);
        const item = itemsRes?.results?.[0] ?? null;
        return {
          id: pid,
          title: prodRes.name || prodRes.title || "",
          price: item?.price ?? null,
          original_price: item?.original_price ?? null,
          thumbnail: prodRes.pictures?.[0]?.url ?? null,
          permalink: `https://www.mercadolivre.com.br/p/${pid}`,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((p) => p && p.title && p.price !== null);
}
