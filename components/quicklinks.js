// ═══════════════════════════════════════════════════
// COMPONENTE: QUICK LINKS (ícones de atalho)
// ═══════════════════════════════════════════════════
const QuickLinks = {
  init() {
    const el = document.getElementById("quickLinks");
    if (!el) return;
    const links = Resources.quickLinks || [];
    el.innerHTML = links
      .map(
        (l) => `
      <a href="${l.link}" class="quick-link${l.highlight ? " highlight" : ""}"
        ${l.link.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span class="quick-icon">${l.icon}</span>
        <span class="quick-label">${l.label}</span>
      </a>`,
      )
      .join("");
  },
};
