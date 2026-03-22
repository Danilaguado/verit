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
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  try {
    // ── MODO OFERTAS ESPECIAIS ──
    if (tipo) {
      // Varre múltiplas categorias populares coletando highlights
      // e filtra por desconto para simular as 3 abas
      const CATS_POPULAR = [
        "MLB1000",
        "MLB1051",
        "MLB1144",
        "MLB1276",
        "MLB1246",
        "MLB1132",
        "MLB1574",
        "MLB1196",
        "MLB1430",
        "MLB1039",
        "MLB12404",
        "MLB1222",
        "MLB1499",
        "MLB1384",
        "MLB1403",
      ];

      const allIds = new Set();
      await Promise.all(
        CATS_POPULAR.map(async (catId) => {
          try {
            const res = await fetch(
              `https://api.mercadolibre.com/highlights/MLB/category/${catId}`,
              { headers },
            );
            if (res.ok) {
              const data = await res.json();
              (data.content || []).forEach((i) => allIds.add(i.id));
            }
          } catch {}
        }),
      );

      const productIds = [...allIds].slice(0, 60);
      if (!productIds.length) {
        return response.status(200).json({ results: [] });
      }

      // Busca detalhes de todos
      const all = await Promise.all(
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

      const valid = all.filter((p) => p && p.title && p.price !== null);

      // Filtra por tipo
      let filtered;
      if (tipo === "todas") {
        // Todas com algum desconto
        filtered = valid.filter(
          (p) => p.original_price && p.original_price > p.price,
        );
      } else if (tipo === "relampago") {
        // Desconto > 30%
        filtered = valid.filter(
          (p) =>
            p.original_price &&
            p.original_price > p.price &&
            1 - p.price / p.original_price >= 0.3,
        );
      } else if (tipo === "imbativeis") {
        // Preço mais baixo (ordena por preço crescente)
        filtered = valid
          .filter((p) => p.price < 100)
          .sort((a, b) => a.price - b.price);
      } else {
        filtered = valid;
      }

      return response.status(200).json({ results: filtered.slice(0, 20) });
    }

    // ── MODO CATEGORIA ──
    const targetCat = categoria || "MLB1144";

    async function getHighlightIds(catId, limit = 20) {
      const ids = new Set();
      const res = await fetch(
        `https://api.mercadolibre.com/highlights/MLB/category/${catId}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        (data.content || []).forEach((i) => ids.add(i.id));
      }
      if (ids.size < limit) {
        const catRes = await fetch(
          `https://api.mercadolibre.com/categories/${catId}`,
          { headers },
        );
        if (catRes.ok) {
          const catData = await catRes.json();
          for (const child of catData.children_categories || []) {
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
