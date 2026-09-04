/* Service worker de ASHA.
   Guarda la aplicacion para que abra sin internet. Los DATOS no pasan por
   aca: viven en el almacenamiento local y en Firebase. Esto es solo el
   programa.

   POR QUE LA VERSION 2

   La version anterior hacia "red primero", pero con un fetch comun. Y un
   fetch comun usa el cache HTTP del navegador: GitHub Pages manda las
   paginas con max-age de diez minutos, asi que el fetch devolvia la copia
   guardada sin llegar a preguntarle nada al servidor. Resultado: se subia una
   version nueva y el consultorio seguia viendo la vieja, sin ninguna señal de
   que eso estaba pasando.

   Ahora el documento HTML se pide SIEMPRE con cache:'reload', que obliga a
   ir hasta el servidor. El resto de los archivos si puede usar el cache: son
   los iconos y el manifiesto, que casi nunca cambian. */
const CACHE = 'asha-v2';
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

  /* El programa en si (la navegacion y el index.html) se pide siempre fresco.
     Que el consultorio se quede con una version vieja sin enterarse es peor
     que quedarse sin la aplicacion un momento. */
  const esElPrograma = e.request.mode === 'navigate' ||
                       url.pathname.endsWith('/') ||
                       url.pathname.endsWith('index.html');

  e.respondWith(
    fetch(esElPrograma ? new Request(e.request, {cache: 'reload'}) : e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

/* La aplicacion puede pedirle que se borre entera. Ver "Forzar actualizacion"
   en Ajustes: es la salida cuando, por lo que sea, quedo una version vieja
   pegada y hay que empezar de cero. */
self.addEventListener('message', e => {
  if (e.data === 'borrar-todo') {
    caches.keys()
      .then(ks => Promise.all(ks.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => e.source && e.source.postMessage('borrado'));
  }
});
