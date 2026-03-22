// ═══════════════════════════════════════════════════
// MÓDULO: FILTROS E CATEGORIAS
// ═══════════════════════════════════════════════════
const Filters = {
  catAtiva: "todas",

  getCategoryLabel(p) {
    if (p.category) return p.category;
    if (p.platform === "shopee") return "Shopee";
    if (p.platform === "ml") return "Mercado Livre";
    return null;
  },

  buildCategoryButtons(products) {
    const counts = {};
    products.forEach((p) => {
      const cat = this.getCategoryLabel(p);
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const el = document.getElementById("catFilters");
    if (!el) return;

    let html =
      '<button class="cat-btn active" data-cat="todas" onclick="Filters.setCategory(\'todas\')">Todas</button>';
    cats.forEach(([cat, count]) => {
      html +=
        '<button class="cat-btn" data-cat="' +
        cat +
        '" onclick="Filters.setCategory(\'' +
        cat.replace(/\\/g, "\\\\").replace(/'/g, "\\'") +
        "')\">" +
        cat +
        "</button>";
    });
    el.innerHTML = html;
  },

  setCategory(cat) {
    this.catAtiva = cat;
    document
      .querySelectorAll(".cat-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
    State.paginaAtual = 1;
    Products.applyFilters();
  },

  apply(allProducts) {
    // Filtro de plataforma
    let list = PlatformFilter.filter(allProducts);
    // Filtro de categoria
    list = list.filter(
      (p) =>
        this.catAtiva === "todas" || this.getCategoryLabel(p) === this.catAtiva,
    );
    // Filtro de texto — só quando busca está ativa
    if (Search.isActive()) {
      const q = Utils.normalize(
        document.getElementById("searchInput")?.value?.trim() || "",
      );
      if (q) {
        list = list.filter(
          (p) =>
            Utils.normalize(p.title).includes(q) ||
            Utils.normalize(p.brand || "").includes(q) ||
            Utils.normalize(p.category || "").includes(q),
        );
      }
    }
    return list;
  },
};
