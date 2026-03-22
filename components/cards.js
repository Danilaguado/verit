// ═══════════════════════════════════════════════════
// COMPONENTE: CARDS DE PRODUTO
// ═══════════════════════════════════════════════════
const Cards = {
  render(list) {
    const out = document.getElementById("output");
    if (!out) return;

    if (!list.length) {
      out.innerHTML =
        '<div class="empty-state"><div class="icon">🔍</div>Nenhum produto encontrado.</div>';
      return;
    }

    out.innerHTML =
      '<div class="grid">' + list.map((p) => this._card(p)).join("") + "</div>";
  },

  _card(p) {
    const thumb = p.thumbnail ? p.thumbnail.replace("http://", "https://") : "";
    const disc = p.original_price && p.original_price > p.price;
    const pct =
      p.discount ||
      (disc
        ? Math.round((1 - p.price / p.original_price) * 100) + "% OFF"
        : "");
    const url = Platform.getUrl(p);
    const linkAttr = url
      ? 'href="' + url + '" target="_blank" rel="noopener"'
      : 'href="#"';

    const countdown = p.expires_at
      ? '<span class="countdown-timer" data-expires="' +
        p.expires_at +
        '" ' +
        "style=\"font-size:11px;font-family:'DM Mono',monospace;color:var(--red);font-weight:500;margin-left:6px;\">" +
        (Countdown.format(p.expires_at) || "") +
        "</span>"
      : "";

    const rating =
      p.platform === "shopee" && p.rating
        ? "<div style=\"font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;\">" +
          "⭐ " +
          p.rating.toFixed(1) +
          (p.stock ? " · " + p.stock + " un." : "") +
          "</div>"
        : "";

    const category = p.category
      ? "<div style=\"font-size:10px;color:var(--muted);font-family:'DM Mono',monospace;margin-top:2px;\">" +
        p.category +
        "</div>"
      : "";

    return (
      '<div class="card">' +
      "<a " +
      linkAttr +
      '><img class="card-img" src="' +
      thumb +
      '" alt="" loading="lazy"/></a>' +
      '<div class="card-body">' +
      '<div style="display:flex;align-items:center;margin-bottom:4px;">' +
      Platform.badge(p) +
      countdown +
      "</div>" +
      (p.brand
        ? "<div style=\"font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;\">" +
          p.brand +
          "</div>"
        : "") +
      category +
      '<div class="card-title">' +
      p.title +
      "</div>" +
      rating +
      '<div class="card-prices">' +
      (disc
        ? '<div class="original">' + Utils.fmt(p.original_price) + "</div>"
        : "") +
      '<div class="current">' +
      Utils.fmt(p.price) +
      "</div>" +
      (pct
        ? '<span class="badge">' + Platform.icon(p) + " " + pct + "</span>"
        : "") +
      "</div></div>" +
      '<a class="card-link" ' +
      linkAttr +
      ">ver oferta →</a>" +
      "</div>"
    );
  },
};
