// ═══════════════════════════════════════════════════
// MÓDULO: FILTRO DE PLATAFORMA
// ═══════════════════════════════════════════════════
const PlatformFilter = {
  active: "todas",

  set(platform) {
    this.active = platform;
    // Atualiza botões
    document.querySelectorAll(".platform-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.platform === platform);
    });
    // Reseta categoria e página
    Filters.catAtiva = "todas";
    State.paginaAtual = 1;
    Products.applyFilters();
  },

  // Chamado por Filters.apply() para filtrar por plataforma
  filter(list) {
    if (this.active === "todas") return list;
    return list.filter((p) => (p.platform || "ml") === this.active);
  },
};
