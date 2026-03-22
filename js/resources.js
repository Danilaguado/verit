// ═══════════════════════════════════════════════════
// RESOURCES — Edite aqui todas as imagens, vídeos e links
// ═══════════════════════════════════════════════════
const Resources = {
  // ── HERO (apresentação ao abrir o app) ──────────
  // Coloque aqui o caminho para seu vídeo ou GIF de intro
  hero: {
    type: "gif", // "gif" ou "video"
    src: "./assets/hero.gif", // substitua pelo seu arquivo
    // src: "./assets/hero.mp4", // se for vídeo
  },

  // ── FAVICON ─────────────────────────────────────
  favicon: "./assets/favicon.png",

  // ── CARROSSEL DE BANNERS (3 imagens) ────────────
  banners: [
    { src: "./assets/banner1.jpg", alt: "Oferta 1", link: "#" },
    { src: "./assets/banner2.jpg", alt: "Oferta 2", link: "#" },
    { src: "./assets/banner3.jpg", alt: "Oferta 3", link: "#" },
  ],

  // ── BANNER FIXO (abaixo dos ícones) ─────────────
  bannerFixo: {
    src: "./assets/banner-fixo.jpg",
    alt: "Promoção especial",
    link: "#",
  },

  // ── BANNER SMARTPHONE (fixo na parte inferior) ──
  bannerSmartphone: {
    src: "./assets/banner-smartphone.jpg",
    alt: "Smartphones em oferta",
    link: "#",
  },

  // ── ÍCONES DE CATEGORIAS RÁPIDAS ────────────────
  quickLinks: [
    { icon: "🏷️", label: "Ofertas", link: "#ofertas" },
    { icon: "🎟️", label: "Cupons", link: "#cupons" },
    {
      icon: "💬",
      label: "WhatsApp",
      link: "https://chat.whatsapp.com/SEU_LINK_AQUI",
      highlight: true, // borda iluminada
    },
    { icon: "🛒", label: "ML · Shopee · Amazon", link: "#plataformas" },
  ],

  // ── LINK GRUPO WHATSAPP ─────────────────────────
  whatsappGroup: "https://chat.whatsapp.com/SEU_LINK_AQUI",
};
