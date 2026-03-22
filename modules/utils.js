// ═══════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════
const Utils = {
  fmt(n) {
    return (
      "R$ " +
      n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  },

  normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  },

  setStatus(msg, type) {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  },
};
