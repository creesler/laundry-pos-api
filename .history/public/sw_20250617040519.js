const CACHE_NAME = 'laundry-pos-cache-v1';

// Get the base URL from the service worker scope
const getBaseUrl = () => self.registration.scope;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const baseUrl = getBaseUrl();
      const urlsToCache = [
        baseUrl,
        `${baseUrl}manifest.webmanifest`,
        `${baseUrl}icons/icon-192x192.png`,
        `${baseUrl}icons/icon-512x512.png`,
      ];

      const cache = await caches.open(CACHE_NAME);
      console.log('Caching app shell and assets');
      await cache.addAll(urlsToCache);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clear old caches
      const cacheKeys = await caches.keys();
      const oldCaches = cacheKeys.filter(key => key !== CACHE_NAME);
      await Promise.all(oldCaches.map(key => caches.delete(key)));
      
      await self.clients.claim();
      console.log('Service Worker activated');
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // Try to get from cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        const response = await fetch(event.request);
        
        // Cache successful GET requests
        if (event.request.method === 'GET' && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        // Return a fallback response or rethrow the error
        throw error;
      }
    })()
  );
}); 