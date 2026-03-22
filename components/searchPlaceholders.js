// ═══════════════════════════════════════════════════
// COMPONENTE: SEARCH PLACEHOLDER ANIMADO
// ═══════════════════════════════════════════════════
const SearchPlaceholder = {
  _index: 0,
  _charIndex: 0,
  _deleting: false,
  _timeout: null,
  _input: null,
  _prefix: "Buscar ",

  init() {
    this._input = document.getElementById("searchInput");
    if (!this._input) return;
    const items = Resources.searchPlaceholders || [];
    if (!items.length) return;

    // Só anima quando input estiver vazio e sem foco
    this._tick();

    this._input.addEventListener("focus", () => this._stop());
    this._input.addEventListener("blur", () => {
      if (!this._input.value) this._tick();
    });
  },

  _stop() {
    clearTimeout(this._timeout);
    if (this._input) this._input.placeholder = "Buscar ofertas...";
  },

  _tick() {
    const items = Resources.searchPlaceholders || [];
    if (!items.length) return;
    const word = items[this._index];
    const full = this._prefix + word + "...";
    const current = this._prefix + word.slice(0, this._charIndex);

    if (!this._deleting) {
      // Digita
      this._charIndex++;
      this._input.placeholder = current;
      if (this._charIndex > word.length) {
        // Pausa antes de apagar
        this._deleting = true;
        this._timeout = setTimeout(() => this._tick(), 1800);
        return;
      }
      this._timeout = setTimeout(() => this._tick(), 80);
    } else {
      // Apaga
      this._charIndex--;
      this._input.placeholder = this._prefix + word.slice(0, this._charIndex);
      if (this._charIndex === 0) {
        this._deleting = false;
        this._index = (this._index + 1) % items.length;
        this._timeout = setTimeout(() => this._tick(), 300);
        return;
      }
      this._timeout = setTimeout(() => this._tick(), 40);
    }
  },
};
