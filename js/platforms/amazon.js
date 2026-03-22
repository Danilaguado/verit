// ═══════════════════════════════════════════════════
// PLATAFORMA: AMAZON
// ═══════════════════════════════════════════════════
const Amazon = {
  getUrl(permalink) {
    return permalink || null;
  },

  badge() {
    return '<span class="platform-badge platform-amazon">🛒 Amazon</span>';
  },

  icon() {
    return "🛒";
  },
};
