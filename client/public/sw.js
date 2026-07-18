const CACHE_NAME = 'mohemmaty-v4';

// In development (localhost), self-destruct: clear all caches and unregister
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
    );
  });
} else {
  // Production: full caching strategy

  self.addEventListener('install', () => self.skipWaiting());

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) return caches.delete(cache);
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Skip non-http(s) protocols (ws, chrome-extension, etc.)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Skip API and WebSocket upgrade paths — always network
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
      event.respondWith(
        fetch(req).then((response) => {
          if (req.method === 'GET') {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          }
          return response;
        }).catch(() => caches.match(req))
      );
      return;
    }

    // index.html: network-first (always get latest on deploy)
    if (url.pathname === '/' || url.pathname === '/index.html') {
      event.respondWith(
        fetch(req).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
          return response;
        }).catch(() => caches.match(req))
      );
      return;
    }

    // Static assets (Vite hash-named): stale-while-revalidate
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((response) => {
          if (response.status === 200 && req.method === 'GET') {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, response.clone()));
          }
          return response;
        }).catch(() => {});

        return cached || networkFetch;
      })
    );
  });
}
