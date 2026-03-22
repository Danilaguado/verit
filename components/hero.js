// ═══════════════════════════════════════════════════
// COMPONENTE: HERO — apresentação inicial
// ═══════════════════════════════════════════════════
const Hero = {
  _shown: false,

  show() {
    if (this._shown) return;
    const { type, src } = Resources.hero;
    const overlay = document.getElementById("heroOverlay");
    if (!overlay) return;

    if (type === "video") {
      overlay.innerHTML = `
        <video autoplay muted playsinline
          style="width:100%;height:100%;object-fit:cover;">
          <source src="${src}" type="video/mp4"/>
        </video>`;
    } else {
      overlay.innerHTML = `
        <img src="${src}" alt="Flash Ofertas"
          style="width:100%;height:100%;object-fit:cover;"/>`;
    }

    overlay.style.display = "flex";
    // Fecha ao clicar ou após 4s
    overlay.addEventListener("click", () => this.hide());
    setTimeout(() => this.hide(), 4000);
    this._shown = true;
  },

  hide() {
    const overlay = document.getElementById("heroOverlay");
    if (!overlay) return;
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 400);
  },
};
