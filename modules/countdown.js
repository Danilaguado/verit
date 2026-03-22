// ═══════════════════════════════════════════════════
// MÓDULO: COUNTDOWN
// ═══════════════════════════════════════════════════
const Countdown = {
  _interval: null,

  format(exp) {
    if (!exp) return null;
    const diff = new Date(exp) - new Date();
    if (diff <= 0) return "Encerrada";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return (
      (h > 0 ? h + "h " : "") +
      String(m).padStart(2, "0") +
      "m " +
      String(s).padStart(2, "0") +
      "s"
    );
  },

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  start() {
    this.stop();
    this._interval = setInterval(() => {
      document.querySelectorAll(".countdown-timer").forEach((el) => {
        const txt = this.format(el.dataset.expires);
        el.textContent = txt || "";
        if (txt === "Encerrada") {
          el.style.color = "var(--red)";
          el.closest(".card").style.opacity = "0.5";
        }
      });
    }, 1000);
  },
};
