// ═══════════════════════════════════════════════════
// DISPATCHER: PLATAFORMA
// ═══════════════════════════════════════════════════
const Platform = {
  get(p) {
    if (p.platform === "shopee") return Shopee;
    if (p.platform === "amazon") return Amazon;
    return ML;
  },
  getUrl(p) {
    return this.get(p).getUrl(p.permalink);
  },
  badge(p) {
    return this.get(p).badge();
  },
  icon(p) {
    return this.get(p).icon();
  },
};
