// ═══════════════════════════════════════════════════
// COMPONENTE: CARROSSEL DE BANNERS
// ═══════════════════════════════════════════════════
const Carousel = {
  _current: 0,
  _interval: null,

  init() {
    const el = document.getElementById("carousel");
    if (!el) return;
    const banners = Resources.banners || [];
    if (!banners.length) {
      el.style.display = "none";
      return;
    }

    el.innerHTML = `
      <div class="carousel-track" id="carouselTrack">
        ${banners
          .map(
            (b, i) => `
          <a href="${b.link}" class="carousel-slide" data-index="${i}">
            <img src="${b.src}" alt="${b.alt}" loading="${i === 0 ? "eager" : "lazy"}"/>
          </a>`,
          )
          .join("")}
      </div>
      <div class="carousel-dots" id="carouselDots">
        ${banners.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}" onclick="Carousel.goTo(${i})"></span>`).join("")}
      </div>`;

    this._interval = setInterval(() => this.next(), 4000);
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
