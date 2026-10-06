// Subí este número cada vez que cambies algún archivo, para que el celular baje la versión nueva.
const VERSION = 'precios-v5';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];
const OPCIONALES = ['./logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(ARCHIVOS);
    // Si falta el logo, la app se instala igual
    await Promise.all(OPCIONALES.map((u) => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Páginas: la versión guardada, así abre al instante y sin internet
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then((r) => r || fetch(e.request)));
    // De fondo, si hay internet, actualizamos la copia
    e.waitUntil(
      fetch('./index.html')
        .then((r) => r.ok && caches.open(VERSION).then((c) => c.put('./index.html', r)))
        .catch(() => {}),
    );
    return;
  }

  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
