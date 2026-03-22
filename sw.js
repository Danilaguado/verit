// ═══════════════════════════════════════════════════
// SERVICE WORKER — PWA (instalar como app)
// ═══════════════════════════════════════════════════
const CACHE = "flash-ofertas-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/css/base.css",
  "/css/header.css",
  "/css/controls.css",
  "/css/products.css",
  "/css/pagination.css",
  "/css/home.css",
  "/js/app.js",
];

self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))),
);

self.addEventListener("fetch", (e) =>
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))),
);
