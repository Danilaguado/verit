// ═══════════════════════════════════════════════════
// MÓDULO: AUTH — Login / Usuário
// (Em construção — implementar autenticação aqui)
// ═══════════════════════════════════════════════════
const Auth = {
  user: null,

  // TODO: implementar login
  openLogin() {
    // ex: abrir modal, redirecionar para OAuth, etc.
    console.log("[Auth] openLogin — não implementado ainda");
  },

  isLoggedIn() {
    return !!this.user;
  },

  getAvatar() {
    return this.user?.avatar || null;
  },
};
