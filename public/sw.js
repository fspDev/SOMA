const CACHE_NAME = 'SOMA-cache-v2';

self.addEventListener('install', event => {
  const base = self.registration.scope;
  const urlsToCache = [
    base,
    base + 'index.html',
    base + 'manifest.webmanifest',
    base + 'icon-192.png',
    base + 'icon-512.png',
  ];
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(() => {})
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => response);
    })
  );
});

// Open app when notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/SOMA') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(self.registration.scope);
    })
  );
});
