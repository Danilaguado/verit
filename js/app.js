const API_URL = "https://verit-orpin.vercel.app/api/buscar";
const AFILIADO = "matt_word=ed20240607152234&matt_tool=53313647";

const CATS = [
  { id: "MLB5672", name: "Acessórios para Veículos" },
  { id: "MLB271599", name: "Agro" },
  { id: "MLB1403", name: "Alimentos e Bebidas" },
  { id: "MLB1071", name: "Animais" },
  { id: "MLB1367", name: "Antiguidades e Coleções" },
  { id: "MLB1368", name: "Arte, Papelaria e Armarinho" },
  { id: "MLB1384", name: "Bebês" },
  { id: "MLB1246", name: "Beleza e Cuidado Pessoal" },
  { id: "MLB1132", name: "Brinquedos e Hobbies" },
  { id: "MLB1430", name: "Calçados, Roupas e Bolsas" },
  { id: "MLB1039", name: "Câmeras e Acessórios" },
  { id: "MLB1743", name: "Carros, Motos e Outros" },
  { id: "MLB1574", name: "Casa, Móveis e Decoração" },
  { id: "MLB1051", name: "Celulares e Telefones" },
  { id: "MLB1500", name: "Construção" },
  { id: "MLB5726", name: "Eletrodomésticos" },
  { id: "MLB1000", name: "Eletrônicos, Áudio e Vídeo" },
  { id: "MLB1276", name: "Esportes e Fitness" },
  { id: "MLB263532", name: "Ferramentas" },
  { id: "MLB12404", name: "Games" },
  { id: "MLB1196", name: "Joias e Relógios" },
  { id: "MLB1222", name: "Livros, Revistas e Comics" },
  { id: "MLB1499", name: "Música, Cinema e Séries" },
  { id: "MLB1952", name: "Saúde" },
  { id: "MLB1642", name: "Serviços" },
  { id: "MLB1540", name: "Imóveis" },
  { id: "MLB1459", name: "Indústria e Comércio" },
];

let allProducts = [];
let modoAtivo = "categoria";
let countdownInterval = null;

const fmt = (n) =>
  "R$ " +
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function linkAfiliado(url) {
  if (!url || url.includes("undefined")) return null;
  let finalUrl = url;
  // Corrige domínio para itens diretos MLB-XXXXXXX
  if (url.match(/www\.mercadolivre\.com\.br\/MLB-/)) {
    finalUrl = url.replace(
      "www.mercadolivre.com.br/MLB-",
      "produto.mercadolivre.com.br/MLB-",
    );
  }
  return finalUrl.includes(AFILIADO)
    ? finalUrl
    : finalUrl + (finalUrl.includes("?") ? "&" : "?") + AFILIADO;
}

function setStatus(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (type ? " " + type : "");
}

function setTab(tab) {
  modoAtivo = tab;
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector("[onclick=\"setTab('" + tab + "')\"]")
    .classList.add("active");
  document.getElementById("catRow").style.display =
    tab === "categoria" ? "" : "none";
  if (tab === "relampago") carregarRelampago();
  else stopCountdowns();
}

function loadCategories() {
  const sel = document.getElementById("categorySelect");
  CATS.forEach((c) => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = c.name;
    sel.appendChild(o);
  });
}

// ── COUNTDOWN ──────────────────────────────────────────────
function stopCountdowns() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function formatCountdown(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
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
  countdownInterval = setInterval(() => {
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
// ───────────────────────────────────────────────────────────

function renderProducts() {
  const only = document.getElementById("onlyDiscount").checked;
  const list = only
    ? allProducts.filter((p) => p.original_price && p.original_price > p.price)
    : allProducts;

  document.getElementById("countBadge").textContent =
    list.length + " produto(s)";
  const out = document.getElementById("output");

  if (!list.length) {
    out.innerHTML =
      '<div class="empty-state"><div class="icon">🔍</div>' +
      (only
        ? "Nenhum produto com desconto. Desmarque o filtro para ver todos."
        : "Nenhum produto encontrado.") +
      "</div>";
    return;
  }

  out.innerHTML =
    '<div class="grid">' +
    list
      .map(function (p) {
        var thumb = p.thumbnail
          ? p.thumbnail.replace("http://", "https://")
          : "";
        var disc = p.original_price && p.original_price > p.price;
        var pct =
          p.discount ||
          (disc
            ? "-" + Math.round((1 - p.price / p.original_price) * 100) + "% OFF"
            : "");
        var url = linkAfiliado(p.permalink);
        var linkAttr = url
          ? 'href="' + url + '" target="_blank" rel="noopener"'
          : 'href="#"';
        var countdown = p.expires_at
          ? '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
            "<span style=\"font-size:10px;background:#FFF1CB;color:#000;padding:2px 6px;border-radius:4px;font-family:'DM Mono',monospace;font-weight:500;\">⚡ RELÂMPAGO</span>" +
            '<span class="countdown-timer" data-expires="' +
            p.expires_at +
            '" style="font-size:11px;font-family:\'DM Mono\',monospace;color:var(--red);font-weight:500;">' +
            (formatCountdown(p.expires_at) || "") +
            "</span>" +
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
          countdown +
          (p.brand
            ? "<div style=\"font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;margin-bottom:2px;\">" +
              p.brand +
              "</div>"
            : "") +
          '<div class="card-title">' +
          p.title +
          "</div>" +
          '<div class="card-prices">' +
          (disc
            ? '<div class="original">' + fmt(p.original_price) + "</div>"
            : "") +
          '<div class="current">' +
          fmt(p.price) +
          "</div>" +
          (pct ? '<span class="badge">⚡ ' + pct + "</span>" : "") +
          "</div></div>" +
          '<a class="card-link" ' +
          linkAttr +
          ">ver no mercado livre →</a>" +
          "</div>"
        );
      })
      .join("") +
    "</div>";

  if (modoAtivo === "relampago") startCountdowns();
}

function carregarRelampago() {
  stopCountdowns();
  setStatus("Carregando ofertas relâmpago...", "loading");
  document.getElementById("output").innerHTML =
    '<div class="empty-state">Carregando...</div>';
  document.getElementById("countBadge").textContent = "";

  allProducts = (window.OFERTAS_RELAMPAGO || []).filter(
    (p) =>
      p.title && p.price && p.permalink && !p.permalink.includes("undefined"),
  );

  if (!allProducts.length) {
    setStatus("Nenhuma oferta relâmpago disponível.", "error");
    document.getElementById("output").innerHTML =
      '<div class="empty-state"><div class="icon">⚡</div>Nenhuma oferta no momento.</div>';
  } else {
    const primeiro = allProducts.find((p) => p.expires_at);
    if (primeiro) {
      const expira = new Date(primeiro.expires_at);
      setStatus(
        allProducts.length +
          " ofertas relâmpago — encerram às " +
          expira.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      );
    } else {
      setStatus(allProducts.length + " ofertas relâmpago carregadas.");
    }
    renderProducts();
  }
}

async function buscarProdutos() {
  const catId = document.getElementById("categorySelect").value;
  if (!catId) {
    setStatus("Selecione uma categoria.", "error");
    return;
  }

  const btn = document.getElementById("btnBuscar");
  btn.disabled = true;
  document.getElementById("output").innerHTML =
    '<div class="empty-state">Carregando...</div>';
  document.getElementById("countBadge").textContent = "";
  setStatus("Buscando produtos...", "loading");

  try {
    const res = await fetch(`${API_URL}?categoria=${catId}`);
    if (!res.ok) throw new Error("Erro HTTP " + res.status);
    const data = await res.json();
    if (data.error) {
      setStatus("Erro: " + data.error, "error");
      btn.disabled = false;
      return;
    }
    allProducts = data.results || [];
    if (!allProducts.length) {
      setStatus("Nenhum produto encontrado.", "error");
      document.getElementById("output").innerHTML =
        '<div class="empty-state"><div class="icon">📭</div>Nenhum produto nessa categoria.</div>';
    } else {
      setStatus(allProducts.length + " produtos carregados.");
      renderProducts();
    }
  } catch (e) {
    setStatus("Erro: " + e.message, "error");
    document.getElementById("output").innerHTML =
      '<div class="empty-state"><div class="icon">⚠️</div>' +
      e.message +
      "</div>";
  }
  btn.disabled = false;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});
