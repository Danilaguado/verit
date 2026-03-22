// ═══════════════════════════════════════════════════
// MÓDULO: PRODUTOS
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
    // Reconstrói categorias baseadas nos produtos visíveis da plataforma atual
    const visibleForPlatform = PlatformFilter.filter(State.allProducts);
    Filters.buildCategoryButtons(visibleForPlatform);
    // Mantém categoria ativa se existir, senão reseta para "todas"
    const activeCat = Filters.catAtiva;
    const catExists = visibleForPlatform.some(
      (p) => Filters.getCategoryLabel(p) === activeCat,
    );
    if (!catExists) Filters.catAtiva = "todas";
    document
      .querySelectorAll(".cat-btn")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.cat === Filters.catAtiva),
      );

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
