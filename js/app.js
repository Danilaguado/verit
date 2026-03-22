// ═══════════════════════════════════════════════════
// APP: PONTO DE ENTRADA
// ═══════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {
  // ── Hero ──
  Hero.show();

  // ── Banners fixos ──
  const bf = document.getElementById("bannerFixo");
  const bfImg = document.getElementById("bannerFixoImg");
  if (Resources.bannerFixo?.src) {
    bfImg.src = Resources.bannerFixo.src;
    bfImg.alt = Resources.bannerFixo.alt || "";
    bf.href = Resources.bannerFixo.link || "#";
  } else {
    bf.style.display = "none";
  }

  const bs = document.getElementById("bannerSmartphone");
  const bsImg = document.getElementById("bannerSmartphoneImg");
  if (Resources.bannerSmartphone?.src) {
    bsImg.src = Resources.bannerSmartphone.src;
    bsImg.alt = Resources.bannerSmartphone.alt || "";
    bs.href = Resources.bannerSmartphone.link || "#";
  } else {
    bs.style.display = "none";
  }

  // ── Carrossel e Quick Links ──
  Carousel.init();
  QuickLinks.init();

  // ── Produtos ──
  Products.load();

  // ── Busca ──
  document.getElementById("searchInput").addEventListener("input", function () {
    State.paginaAtual = 1;
    Products.applyFilters();
  });

  // ── PWA instalação ──
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
      if (!deferredPrompt) return;
      const bar = document.createElement("div");
      bar.id = "installBar";
      bar.innerHTML = `
        <span>📲 Instale o Flash Ofertas!</span>
        <button onclick="installApp()">Instalar</button>
        <button onclick="this.parentElement.remove()" style="background:transparent;color:#fff;border:none;cursor:pointer;font-size:18px;padding:0 4px;">✕</button>`;
      bar.style.cssText = `position:fixed;bottom:0;left:0;right:0;z-index:999;
        background:var(--primary);color:#fff;display:flex;align-items:center;
        gap:12px;padding:12px 1.5rem;font-family:'DM Sans',sans-serif;font-size:13px;`;
      bar.querySelector("button").style.cssText =
        `background:#fff;color:var(--primary);
        border:none;border-radius:20px;padding:6px 16px;font-weight:600;cursor:pointer;`;
      document.body.appendChild(bar);
    }, 3000);
  });

  window.installApp = async function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById("installBar")?.remove();
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
