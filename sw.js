const CACHE_NAME = 'SOMA-cache-v1';

self.addEventListener('install', event => {
  const base = self.registration.scope;
  const urlsToCache = [
    base,
    base + 'index.html',
    base + 'manifest.webmanifest',
    base + 'icon.png',
    base + 'icon-192.png',
    base + 'icon-512.png',
  ];
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(reason => {
            console.log(`No se pudo cachear ${url}: ${reason}`);
          })
        )
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(networkResponse => {
        if (event.request.url.startsWith('chrome-extension://')) {
          return networkResponse;
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});
