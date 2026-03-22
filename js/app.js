// ─── CONFIGURAÇÃO ─────────────────────────────────────────
const AFILIADO = "matt_word=ed20240607152234&matt_tool=53313647";
const POR_PAGINA = 50;
// ──────────────────────────────────────────────────────────

let allProducts = [];
let filteredList = [];
let paginaAtual = 1;
let catAtiva = "todas";
let countdownInt = null;

const fmt = (n) =>
  "R$ " +
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Normaliza texto removendo acentos e convertendo para minúsculas
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function linkML(url) {
  if (!url || url.includes("undefined")) return null;
  let u = url;
  if (u.match(/mercadolivre\.com\.br\/MLB-/))
    u = u.replace(
      "www.mercadolivre.com.br/MLB-",
      "produto.mercadolivre.com.br/MLB-",
    );
  return u.includes(AFILIADO)
    ? u
    : u + (u.includes("?") ? "&" : "?") + AFILIADO;
}

function getUrl(p) {
  return p.platform === "ml" ? linkML(p.permalink) : p.permalink;
}

function setStatus(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (type ? " " + type : "");
}

function stopCountdowns() {
  if (countdownInt) {
    clearInterval(countdownInt);
    countdownInt = null;
  }
}

function formatCountdown(exp) {
  if (!exp) return null;
  const diff = new Date(exp) - new Date();
  if (diff <= 0) return "Encerrada";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    (h > 0 ? h + "h " : "") +
    String(m).padStart(2, "0") +
    "m " +
    String(s).padStart(2, "0") +
    "s"
  );
}

function startCountdowns() {
  stopCountdowns();
  countdownInt = setInterval(() => {
    document.querySelectorAll(".countdown-timer").forEach((el) => {
      const txt = formatCountdown(el.dataset.expires);
      el.textContent = txt || "";
      if (txt === "Encerrada") {
        el.style.color = "var(--red)";
        el.closest(".card").style.opacity = "0.5";
      }
    });
  }, 1000);
}

// ─── CATEGORIAS DINÂMICAS ─────────────────────────────────
function getCategoryLabel(p) {
  if (p.category) return p.category;
  if (p.platform === "shopee") return "Shopee";
  if (p.platform === "ml") return "Mercado Livre";
  return null;
}

function buildCategoryFilters() {
  const counts = {};
  allProducts.forEach((p) => {
    const cat = getCategoryLabel(p);
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  });

  const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const el = document.getElementById("catFilters");
  let html =
    '<button class="cat-btn active" data-cat="todas" onclick="setCategoria(\'todas\')">Todas (' +
    allProducts.length +
    ")</button>";
  cats.forEach(function ([cat, count]) {
    html +=
      '<button class="cat-btn" data-cat="' +
      cat +
      '" onclick="setCategoria(\'' +
      cat.replace(/\\/g, "\\\\").replace(/'/g, "\\'") +
      "')\">" +
      cat +
      " (" +
      count +
      ")</button>";
  });
  el.innerHTML = html;
}

function setCategoria(cat) {
  catAtiva = cat;
  document.querySelectorAll(".cat-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === cat);
  });
  paginaAtual = 1;
  aplicarFiltros();
}

// ─── FILTROS ──────────────────────────────────────────────
function aplicarFiltros() {
  const q = normalize(document.getElementById("searchInput").value.trim());

  filteredList = allProducts.filter((p) => {
    const matchCat = catAtiva === "todas" || getCategoryLabel(p) === catAtiva;
    const matchSearch =
      !q ||
      normalize(p.title).includes(q) ||
      normalize(p.brand || "").includes(q) ||
      normalize(p.category || "").includes(q);
    return matchCat && matchSearch;
  });

  paginaAtual = 1;
  renderPage();
}

// ─── PAGINAÇÃO ────────────────────────────────────────────
function renderPage() {
  const total = filteredList.length;
  const pages = Math.ceil(total / POR_PAGINA);
  const start = (paginaAtual - 1) * POR_PAGINA;
  const slice = filteredList.slice(start, start + POR_PAGINA);

  document.getElementById("countBadge").textContent = total + " produto(s)";
  renderCards(slice);
  renderPagination(pages);
  startCountdowns();
}

function goPage(n) {
  paginaAtual = n;
  renderPage();
  // Volta ao topo do scroll interno sem mover a página
  const scroll = document.getElementById("produtosScroll");
  if (scroll) scroll.scrollTop = 0;
}

function renderPagination(pages) {
  const el = document.getElementById("pagination");
  if (pages <= 1) {
    el.innerHTML =
      "<span style=\"font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);\">Página 1 de 1</span>";
    return;
  }

  const prev = paginaAtual > 1;
  const next = paginaAtual < pages;
  const start = Math.max(1, Math.min(paginaAtual - 3, pages - 6));
  const end = Math.min(pages, start + 6);

  let html =
    '<button class="page-btn" ' +
    (prev ? 'onclick="goPage(' + (paginaAtual - 1) + ')"' : "disabled") +
    ">‹</button>";
  for (let i = start; i <= end; i++) {
    html +=
      '<button class="page-btn' +
      (i === paginaAtual ? " active" : "") +
      '" onclick="goPage(' +
      i +
      ')">' +
      i +
      "</button>";
  }
  html +=
    '<button class="page-btn" ' +
    (next ? 'onclick="goPage(' + (paginaAtual + 1) + ')"' : "disabled") +
    ">›</button>";
  el.innerHTML = html;
}

// ─── CARDS ────────────────────────────────────────────────
function renderCards(list) {
  const out = document.getElementById("output");
  if (!list.length) {
    out.innerHTML =
      '<div class="empty-state"><div class="icon">🔍</div>Nenhum produto encontrado.</div>';
    return;
  }

  out.innerHTML =
    '<div class="grid">' +
    list
      .map((p) => {
        const platform = p.platform || "ml";
        const thumb = p.thumbnail
          ? p.thumbnail.replace("http://", "https://")
          : "";
        const disc = p.original_price && p.original_price > p.price;
        const pct =
          p.discount ||
          (disc
            ? Math.round((1 - p.price / p.original_price) * 100) + "% OFF"
            : "");
        const url = getUrl(p);
        const linkAttr = url
          ? 'href="' + url + '" target="_blank" rel="noopener"'
          : 'href="#"';

        const badgeClass =
          platform === "shopee"
            ? "platform-shopee"
            : platform === "amazon"
              ? "platform-amazon"
              : "platform-ml";
        const badgeText =
          platform === "shopee"
            ? "🛍 Shopee"
            : platform === "amazon"
              ? "🛒 Amazon"
              : "⚡ ML";
        const badgeIcon =
          platform === "shopee" ? "🛍" : platform === "amazon" ? "🛒" : "⚡";

        const countdown = p.expires_at
          ? '<span class="countdown-timer" data-expires="' +
            p.expires_at +
            '" style="font-size:11px;font-family:\'DM Mono\',monospace;color:var(--red);font-weight:500;margin-left:6px;">' +
            (formatCountdown(p.expires_at) || "") +
            "</span>"
          : "";

        const rating =
          platform === "shopee" && p.rating
            ? "<div style=\"font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;\">⭐ " +
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
          '<span class="platform-badge ' +
          badgeClass +
          '">' +
          badgeText +
          "</span>" +
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
            ? '<div class="original">' + fmt(p.original_price) + "</div>"
            : "") +
          '<div class="current">' +
          fmt(p.price) +
          "</div>" +
          (pct
            ? '<span class="badge">' + badgeIcon + " " + pct + "</span>"
            : "") +
          "</div></div>" +
          '<a class="card-link" ' +
          linkAttr +
          ">ver oferta →</a>" +
          "</div>"
        );
      })
      .join("") +
    "</div>";
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const ml = (window.OFERTAS_ML || []).filter(
    (p) => p.title && p.price && p.permalink,
  );
  const shopee = (window.OFERTAS_SHOPEE || []).filter(
    (p) => p.title && p.price && p.permalink,
  );
  const amazon = (window.OFERTAS_AMAZON || []).filter(
    (p) => p.title && p.price && p.permalink,
  );

  allProducts = [...ml, ...shopee, ...amazon];

  setStatus(
    "ML: " +
      ml.length +
      " | Shopee: " +
      shopee.length +
      " | Amazon: " +
      amazon.length,
  );
  buildCategoryFilters();
  filteredList = allProducts;
  renderPage();

  document
    .getElementById("searchInput")
    .addEventListener("input", aplicarFiltros);
});
