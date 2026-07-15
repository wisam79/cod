const CACHE_NAME = 'mohemmaty-cache-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app-icon.png',
        '/favicon.svg',
        '/icons.svg',
        '/manifest.json'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    event.respondWith(
      fetch(req).then((response) => {
        if (req.method === 'GET') {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clonedResponse);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(req);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(req).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, response);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(req).then((response) => {
        if (response.status === 200 && req.method === 'GET') {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clonedResponse);
          });
        }
        return response;
      });
    })
  );
});
