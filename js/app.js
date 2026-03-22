const API_URL = "https://verit-orpin.vercel.app/api/buscar";

// Categorias reais do Mercado Livre Brasil (MLB)
const CATS = [
  { id: "MLB5672", name: "Acessórios para Veículos" },
  { id: "MLB1403", name: "Agro" },
  { id: "MLB1071", name: "Alimentos e Bebidas" },
  { id: "MLB1367", name: "Animais" },
  { id: "MLB1500", name: "Antiguidades e Coleções" },
  { id: "MLB1168", name: "Bebês" },
  { id: "MLB1182", name: "Brinquedos e Hobbies" },
  { id: "MLB1246", name: "Calçados, Roupas e Bolsas" },
  { id: "MLB1039", name: "Câmeras e Acessórios" },
  { id: "MLB1051", name: "Carros, Motos e Outros" },
  { id: "MLB1131", name: "Casa, Móveis e Decoração" },
  { id: "MLB1648", name: "Celulares e Telefones" },
  { id: "MLB1574", name: "Construção" },
  { id: "MLB1144", name: "Eletrodomésticos" },
  { id: "MLB1000", name: "Eletrônicos, Áudio e Vídeo" },
  { id: "MLB1276", name: "Esportes e Fitness" },
  { id: "MLB1159", name: "Ferramentas" },
  { id: "MLB264586", name: "Games" },
  { id: "MLB1196", name: "Joias e Relógios" },
  { id: "MLB1222", name: "Livros, Revistas e Comics" },
  { id: "MLB1499", name: "Música, Cinema e Séries" },
  { id: "MLB1952", name: "Saúde e Beleza" },
  { id: "MLB1642", name: "Serviços" },
  { id: "MLB1540", name: "Imóveis" },
];

let allProducts = [];

const fmt = (n) =>
  "R$ " +
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function setStatus(msg, type) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (type ? " " + type : "");
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
        var pct = disc ? Math.round((1 - p.price / p.original_price) * 100) : 0;
        return (
          '<div class="card">' +
          '<img class="card-img" src="' +
          thumb +
          '" alt="" loading="lazy"/>' +
          '<div class="card-body"><div class="card-title">' +
          p.title +
          "</div>" +
          '<div class="card-prices">' +
          (disc
            ? '<div class="original">' + fmt(p.original_price) + "</div>"
            : "") +
          '<div class="current">' +
          fmt(p.price) +
          "</div>" +
          (disc ? '<span class="badge">-' + pct + "% OFF</span>" : "") +
          "</div></div>" +
          '<a class="card-link" href="' +
          p.permalink +
          '" target="_blank">ver no mercado livre →</a>' +
          "</div>"
        );
      })
      .join("") +
    "</div>";
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

    if (!res.ok) {
      throw new Error("Erro HTTP " + res.status);
    }

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
  document
    .getElementById("btnBuscar")
    .addEventListener("click", buscarProdutos);
  document
    .getElementById("onlyDiscount")
    .addEventListener("change", renderProducts);
});
