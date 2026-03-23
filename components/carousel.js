// ═══════════════════════════════════════════════════
// COMPONENTE: CARROSSEL — setas laterais + gradiente
// ═══════════════════════════════════════════════════
const Carousel = {
  _current: 0,
  _interval: null,

  init() {
    const el = document.getElementById("carousel");
    if (!el) return;
    const banners = Resources.banners || [];
    if (!banners.length) {
      el.closest(".carousel-wrap").style.display = "none";
      return;
    }

    el.innerHTML = `
      <!-- Seta esquerda -->
      <button class="carousel-arrow carousel-arrow-left" onclick="Carousel.prev()" aria-label="Anterior">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <!-- Track de slides -->
      <div class="carousel-track" id="carouselTrack">
        ${banners
          .map(
            (b, i) => `
          <a href="${b.link}" class="carousel-slide" target="${b.link !== "#" ? "_blank" : "_self"}" rel="noopener">
            <img src="${b.src}" alt="${b.alt}" loading="${i === 0 ? "eager" : "lazy"}"/>
          </a>`,
          )
          .join("")}
      </div>

      <!-- Seta direita -->
      <button class="carousel-arrow carousel-arrow-right" onclick="Carousel.next()" aria-label="Próximo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <!-- Gradiente inferior -->
      <div class="carousel-gradient"></div>

      <!-- Dots -->
      <div class="carousel-dots" id="carouselDots">
        ${banners
          .map(
            (_, i) => `
          <span class="dot${i === 0 ? " active" : ""}" onclick="Carousel.goTo(${i})"></span>`,
          )
          .join("")}
      </div>`;

    // Swipe touch
    let startX = 0;
    const track = document.getElementById("carouselTrack");
    track.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? this.next() : this.prev();
    });

    this._interval = setInterval(() => this.next(), 4500);
  },

  goTo(index) {
    const banners = Resources.banners || [];
    this._current = (index + banners.length) % banners.length;
    const track = document.getElementById("carouselTrack");
    if (track) track.style.transform = `translateX(-${this._current * 100}%)`;
    document
      .querySelectorAll(".dot")
      .forEach((d, i) => d.classList.toggle("active", i === this._current));
  },

  next() {
    this.goTo(this._current + 1);
  },
  prev() {
    this.goTo(this._current - 1);
  },
};
