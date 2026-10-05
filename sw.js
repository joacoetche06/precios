// Subí este número cada vez que cambies index.html, para que el celular baje la versión nueva.
const VERSION = 'precios-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];
const CACHE_COMPARTIDO = 'compartido';
const URL_COMPARTIDO = './__lista-compartida';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((k) => k !== VERSION && k !== CACHE_COMPARTIDO).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // "Compartir" desde WhatsApp → guardamos el archivo y abrimos la app
  if (e.request.method === 'POST' && url.pathname.endsWith('/compartir')) {
    e.respondWith((async () => {
      try {
        const form = await e.request.formData();
        const archivo = form.get('lista');
        if (archivo && typeof archivo.text === 'function') {
          const cache = await caches.open(CACHE_COMPARTIDO);
          await cache.put(URL_COMPARTIDO, new Response(await archivo.text(), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }
      } catch (err) {
        // Si falla, la app abre igual con la lista anterior
      }
      return Response.redirect('./?compartido=1', 303);
    })());
    return;
  }

  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Páginas: la versión guardada, así abre al instante y sin internet
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then((r) => r || fetch(e.request)),
    );
    // De fondo, si hay internet, actualizamos la copia
    e.waitUntil(
      fetch('./index.html').then((r) => r.ok && caches.open(VERSION).then((c) => c.put('./index.html', r))).catch(() => {}),
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request)),
  );
});
