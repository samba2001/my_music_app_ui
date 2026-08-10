const CACHE_NAME = 'homelab-music-cache-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, '/manifest.json']))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cache) => {
      if (cache !== CACHE_NAME) {
        return caches.delete(cache);
      }
      return null;
    })))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.destination === 'audio') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return cachedResponse || new Response('', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
