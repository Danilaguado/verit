export default async function handler(request, response) {
  const { categoria, code } = request.query;

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

  const targetCat = categoria || "MLB1144";
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  };

  try {
    // Coleta IDs de highlights da categoria principal + todas as subcategorias
    // até ter 20 produtos
    async function getHighlightIds(catId, limit = 20) {
      const ids = new Set();

      // Tenta highlights da categoria principal
      const res = await fetch(
        `https://api.mercadolibre.com/highlights/MLB/category/${catId}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        (data.content || []).forEach((i) => ids.add(i.id));
      }

      // Se ainda não tem 20, busca subcategorias
      if (ids.size < limit) {
        const catRes = await fetch(
          `https://api.mercadolibre.com/categories/${catId}`,
          { headers },
        );
        if (catRes.ok) {
          const catData = await catRes.json();
          const children = catData.children_categories || [];

          for (const child of children) {
            if (ids.size >= limit) break;
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

      return [...ids].slice(0, limit);
    }

    const productIds = await getHighlightIds(targetCat, 20);

    if (!productIds.length) {
      return response.status(200).json({ results: [] });
    }

    // Busca detalhes + preço de cada produto em paralelo
    const results = await Promise.all(
      productIds.map(async (pid) => {
        try {
          const [prodRes, itemsRes] = await Promise.all([
            fetch(`https://api.mercadolibre.com/products/${pid}`, {
              headers,
            }).then((r) => r.json()),
            fetch(
              `https://api.mercadolibre.com/products/${pid}/items?limit=1`,
              { headers },
            ).then((r) => r.json()),
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

    return response.status(200).json({
      results: results.filter((p) => p && p.title && p.price !== null),
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
