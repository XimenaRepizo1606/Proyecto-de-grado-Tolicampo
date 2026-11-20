// Service worker de ToliCampo (PWA): guarda la aplicación para que abra rápido con mala señal.
// Las respuestas de la API no se guardan: siempre se piden a la red para no mostrar precios viejos.
const VERSION = 'tolicampo-v1';
const BASICOS = ['/', '/index.html', '/manifest.webmanifest', '/imagenes/logo-tolicampo.svg', '/imagenes/banner.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // la API va directo a la red
  if (e.request.mode === 'navigate') {
    // Páginas: primero la red; sin conexión, la copia guardada
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
    return;
  }
  // Archivos de la aplicación e imágenes: primero la copia guardada
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
    if (resp.ok) { const copia = resp.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
    return resp;
  })));
});
