// ═══════════════════════════════════════════════════
// MÓDULO: SEARCH — busca manual com loader
// ═══════════════════════════════════════════════════
const Search = {
  _inSearch: false,

  // Exibe o loader por 'ms' milissegundos e depois executa cb
  _withLoader(ms, cb) {
    const loader = document.getElementById("loader");
    loader.style.display = "flex";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loader.classList.add("visible");
        setTimeout(() => {
          cb();
          loader.classList.remove("visible");
          setTimeout(() => {
            loader.style.display = "none";
          }, 200);
        }, ms);
      });
    });
  },

  // Executa busca ao clicar na seta ou apertar Enter
  run() {
    const q = document.getElementById("searchInput").value.trim();
    if (!q) {
      this.clear();
      return;
    }

    this._inSearch = true;
    this._withLoader(2000, () => {
      // Esconde homeScreen, mostra resultsScreen
      document.getElementById("homeScreen").style.display = "none";
      document.getElementById("resultsScreen").style.display = "block";
      document.getElementById("resultsQuery").textContent = '"' + q + '"';
      document.getElementById("countBar").style.display = "block";

      // Aplica filtro
      State.paginaAtual = 1;
      Products.applyFilters();

      // Scroll para o topo dos produtos
      window.scrollTo({ top: 0 });
    });
  },

  // Volta para home
  clear() {
    this._inSearch = false;
    document.getElementById("searchInput").value = "";
    document.getElementById("homeScreen").style.display = "block";
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("countBar").style.display = "none";

    State.paginaAtual = 1;
    Products.applyFilters();
  },

  isActive() {
    return this._inSearch;
  },
};
