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
      el.innerHTML =
        "<span style=\"font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);\">Página 1 de 1</span>";
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
    State.paginaAt; // ═══════════════════════════════════════════════════
    // COMPONENTE: PAGINAÇÃO
    // ═══════════════════════════════════════════════════
    const Pagination = {
      POR_PAGINA: 50,

      render(total) {
        const pages = Math.ceil(total / this.POR_PAGINA);
        const el = document.getElementById("pagination");
        if (!el) return;

        if (pages <= 1) {
          el.innerHTML =
            "<span style=\"font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);\">Página 1 de 1</span>";
          return;
        }

        const cur = State.paginaAtual;
        const prev = cur > 1;
        const next = cur < pages;
        const start = Math.max(1, Math.min(cur - 3, pages - 6));
        const end = Math.min(pages, start + 6);

        let html =
          '<button class="page-btn" ' +
          (prev
            ? 'onclick="Pagination.goPage(' + (cur - 1) + ')"'
            : "disabled") +
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
          (next
            ? 'onclick="Pagination.goPage(' + (cur + 1) + ')"'
            : "disabled") +
          ">›</button>";
        el.innerHTML = html;
      },

      goPage(n) {
        State.paginaAtual = n;
        Products.renderPage();
        const el = document.getElementById("produtosScroll");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    };
    ual = n;
    Products.renderPage();
    const scroll = document.getElementById("produtosScroll");
    if (scroll) scroll.scrollTop = 0;
  },
};
