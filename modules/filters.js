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

  buildCategoryButtons(allProducts) {
    const counts = {};
    allProducts.forEach((p) => {
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
        ' <span style="opacity:.5;font-size:11px;">(' +
        count +
        ")</span></button>";
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
    const q = Utils.normalize(
      document.getElementById("searchInput")?.value?.trim() || "",
    );
    // Primeiro filtra por plataforma
    let list = PlatformFilter.filter(allProducts);
    // Depois por categoria
    list = list.filter((p) => {
      const matchCat =
        this.catAtiva === "todas" || this.getCategoryLabel(p) === this.catAtiva;
      const matchSearch =
        !q ||
        Utils.normalize(p.title).includes(q) ||
        Utils.normalize(p.brand || "").includes(q) ||
        Utils.normalize(p.category || "").includes(q);
      return matchCat && matchSearch;
    });
    return list;
  },
};
