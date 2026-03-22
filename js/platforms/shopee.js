// ═══════════════════════════════════════════════════
// PLATAFORMA: SHOPEE
// ═══════════════════════════════════════════════════
const Shopee = {
  getUrl(permalink) {
    return permalink || null;
  },

  badge() {
    return '<span class="platform-badge platform-shopee">🛍 Shopee</span>';
  },

  icon() {
    return "🛍";
  },
};
