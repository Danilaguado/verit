// ═══════════════════════════════════════════════════
// COMPONENTE: PAGINAÇÃO
// ═══════════════════════════════════════════════════
const Pagination = {
  POR_PAGINA: 50,

  render(total) {
    const pages = Math.ceil(total / this.POR_PAGINA);
    const el = document.getElementById("pagination");
    if (!el) return;

    if (pages <= 1) {
      el.innerHTML = "";
      return;
    }

    const cur = State.paginaAtual;
    const prev = cur > 1;
    const next = cur < pages;
    const start = Math.max(1, Math.min(cur - 3, pages - 6));
    const end = Math.min(pages, start + 6);

    let html =
      '<button class="page-btn" ' +
      (prev ? 'onclick="Pagination.goPage(' + (cur - 1) + ')"' : "disabled") +
      ">‹</button>";
    for (let i = start; i <= end; i++) {
      html +=
        '<button class="page-btn' +
        (i === cur ? " active" : "") +
        '" onclick="Pagination.goPage(' +
        i +
        ')">' +
        i +
        "</button>";
    }
    html +=
      '<button class="page-btn" ' +
      (next ? 'onclick="Pagination.goPage(' + (cur + 1) + ')"' : "disabled") +
      ">›</button>";
    el.innerHTML = html;
  },

  goPage(n) {
    // Scroll até o início dos produtos — não o topo da página
    const anchor = document.getElementById("produtosScroll");
    if (anchor) {
      const top = anchor.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top, behavior: "instant" });
    }

    // Loader 800ms por cima enquanto troca os cards
    const loader = document.getElementById("loader");
    loader.style.display = "flex";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        loader.classList.add("visible");
        setTimeout(() => {
          State.paginaAtual = n;
          Products.renderPage();
          loader.classList.remove("visible");
          setTimeout(() => {
            loader.style.display = "none";
          }, 200);
        }, 800);
      }),
    );
  },
};
