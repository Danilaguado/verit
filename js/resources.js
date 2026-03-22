// ═══════════════════════════════════════════════════
// RESOURCES — Edite aqui todas as imagens, vídeos e links
// ═══════════════════════════════════════════════════
const Resources = {
  // ── FAVICON / LOGO DO SITE ───────────────────────
  // Coloque seu arquivo em assets/favicon.png
  favicon: "./assets/favicon.png",

  // ── HERO / SPLASH SCREEN ─────────────────────────
  // O PWA já usa o favicon como splash nativo ao instalar.
  // Se quiser uma splash customizada DENTRO do browser
  // (antes do app carregar), ative aqui:
  //
  // hero: {
  //   enabled: true,
  //   type: "gif",           // "gif" | "video" | "logo"
  //   src:  "./assets/hero.gif",
  // },
  //
  // Por padrão desativado para não duplicar com o ícone PWA:
  hero: { enabled: false },

  // ── CARROSSEL DE BANNERS ────────────────────────
  banners: [
    { src: "./assets/banner1.jpg", alt: "Oferta 1", link: "#" },
    { src: "./assets/banner2.jpg", alt: "Oferta 2", link: "#" },
    { src: "./assets/banner3.jpg", alt: "Oferta 3", link: "#" },
  ],

  // ── BANNER FIXO ─────────────────────────────────
  bannerFixo: {
    src: "./assets/banner-fixo.jpg",
    alt: "Promoção especial",
    link: "#",
  },

  // ── BANNER SMARTPHONE ───────────────────────────
  bannerSmartphone: {
    src: "./assets/banner-smartphone.jpg",
    alt: "Smartphones em oferta",
    link: "#",
  },

  // ── WHATSAPP ─────────────────────────────────────
  whatsappGroup: "https://chat.whatsapp.com/SEU_LINK_AQUI",

  // ── PLACEHOLDER DO BUSCADOR (rotativo) ───────────
  // Coloque nomes de produtos que aparecerão animados
  searchPlaceholders: [
    "Tênis Kappa",
    "Whey Protein",
    "Air Fryer",
    "Fone Bluetooth",
    "Smartwatch",
    "Cafeteira",
    "Kit Camisetas",
    "Mochila",
    "Projetor 4K",
    "Panela de Pressão",
  ],
};
