// ═══════════════════════════════════════════════════
// PLATAFORMA: MERCADO LIVRE
// ═══════════════════════════════════════════════════
const ML = {
  AFILIADO: "matt_word=ed20240607152234&matt_tool=53313647",

  getUrl(permalink) {
    if (!permalink || permalink.includes("undefined")) return null;
    let url = permalink.trim();
    // Corrige domínio para itens MLB-XXXXXXX
    if (url.match(/(?:www\.)?mercadolivre\.com\.br\/MLB-/)) {
      url = url.replace(
        /(?:www\.)?mercadolivre\.com\.br\/MLB-/,
        "produto.mercadolivre.com.br/MLB-",
      );
    }
    if (!url.startsWith("http")) url = "https://" + url;
    return url + (url.includes("?") ? "&" : "?") + this.AFILIADO;
  },

  badge() {
    return '<span class="platform-badge platform-ml">⚡ ML</span>';
  },

  icon() {
    return "⚡";
  },
};
