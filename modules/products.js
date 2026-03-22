// ═══════════════════════════════════════════════════
// MÓDULO: PRODUTOS (orquestra tudo)
// ═══════════════════════════════════════════════════
const Products = {
  load() {
    const ml = (window.OFERTAS_ML || []).filter(
      (p) => p.title && p.price && p.permalink,
    );
    const shopee = (window.OFERTAS_SHOPEE || []).filter(
      (p) => p.title && p.price && p.permalink,
    );
    const amazon = (window.OFERTAS_AMAZON || []).filter(
      (p) => p.title && p.price && p.permalink,
    );

    State.allProducts = [...ml, ...shopee, ...amazon];

    Utils.setStatus(
      "ML: " +
        ml.length +
        " | Shopee: " +
        shopee.length +
        " | Amazon: " +
        amazon.length,
    );
    Filters.buildCategoryButtons(State.allProducts);
    this.applyFilters();
  },

  applyFilters() {
    State.filteredList = Filters.apply(State.allProducts);
    State.paginaAtual = 1;
    this.renderPage();
  },

  renderPage() {
    const total = State.filteredList.length;
    const start = (State.paginaAtual - 1) * Pagination.POR_PAGINA;
    const slice = State.filteredList.slice(
      start,
      start + Pagination.POR_PAGINA,
    );

    document.getElementById("countBadge").textContent = total + " produto(s)";
    Cards.render(slice);
    Pagination.render(total);
    Countdown.start();
  },
};
