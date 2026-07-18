const CACHE_NAME = 'mohemmaty-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
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
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

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

  // index.html: always network-first (detect new deploys)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(req).then((response) => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, clonedResponse);
        });
        return response;
      }).catch(() => {
        return caches.match(req);
      })
    );
    return;
  }

  // Static assets (hashed by Vite): stale-while-revalidate
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
