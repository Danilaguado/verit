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
    // 1. Tenta highlights da categoria
    const highlightRes = await fetch(
      `https://api.mercadolibre.com/highlights/MLB/category/${targetCat}`,
      { headers },
    );

    // Se highlights falhou ou não tem conteúdo, tenta subcategorias
    let productIds = [];

    if (highlightRes.ok) {
      const highlightData = await highlightRes.json();
      productIds = (highlightData.content || []).slice(0, 20).map((i) => i.id);
    }

    // Se a categoria não tem highlights, busca subcategorias e tenta nelas
    if (!productIds.length) {
      const catRes = await fetch(
        `https://api.mercadolibre.com/categories/${targetCat}`,
        { headers },
      );
      const catData = await catRes.json();
      const children = (catData.children_categories || []).slice(0, 5);

      // Tenta highlights de cada subcategoria até achar produtos
      for (const child of children) {
        const subRes = await fetch(
          `https://api.mercadolibre.com/highlights/MLB/category/${child.id}`,
          { headers },
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          const ids = (subData.content || []).slice(0, 20).map((i) => i.id);
          if (ids.length) {
            productIds = ids;
            break;
          }
        }
      }
    }

    if (!productIds.length) {
      return response.status(200).json({ results: [] });
    }

    // 2. Busca detalhes + preço de cada produto
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
