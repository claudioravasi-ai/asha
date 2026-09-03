/* Service worker de ALGOS.
   Guarda la aplicacion para que abra sin internet. Los DATOS no pasan por
   aca: viven en el almacenamiento local y en Firebase. Esto es solo el
   programa.

   Estrategia: red primero y cache como respaldo. Asi el consultorio siempre
   ve la version mas nueva cuando hay conexion, y sigue funcionando cuando
   no la hay. */
const CACHE = 'algos-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  /* Firebase y Apps Script nunca se cachean: son datos vivos. */
  if (!url.origin.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
