const CACHE_NAME = 'laundry-pos-cache-v1';
const FALLBACK_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Laundry POS</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; }
        h1 { color: #1976d2; }
    </style>
</head>
<body>
    <h1>You are offline</h1>
    <p>Please check your internet connection and try again.</p>
</body>
</html>
`;

// Get the base URL from the service worker scope
const getBaseUrl = () => self.registration.scope.replace(/\/$/, '');

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const baseUrl = getBaseUrl();
        const urlsToCache = [
          '/',
          '/manifest.webmanifest',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png',
        ].map(url => `${baseUrl}${url}`);

        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching app shell and assets');
        
        // Create a fallback offline page
        const fallbackResponse = new Response(FALLBACK_HTML, {
          headers: { 'Content-Type': 'text/html' }
        });
        await cache.put(`${baseUrl}/offline.html`, fallbackResponse);
        
        // Cache other assets
        await cache.addAll(urlsToCache);
        await self.skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Install failed:', error);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Clear old caches
        const cacheKeys = await caches.keys();
        const oldCaches = cacheKeys.filter(key => key !== CACHE_NAME);
        await Promise.all(oldCaches.map(key => caches.delete(key)));
        
        await self.clients.claim();
        console.log('[Service Worker] Activated and claimed clients');
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const baseUrl = getBaseUrl();
        
        // Network-first strategy for API requests
        if (event.request.url.includes('/api/')) {
          try {
            const networkResponse = await fetch(event.request);
            return networkResponse;
          } catch (error) {
            const cachedResponse = await caches.match(event.request);
            return cachedResponse || new Response(JSON.stringify({ error: 'Network error' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Cache-first strategy for static assets
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          
          // Cache successful GET requests for static assets
          if (event.request.method === 'GET' && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            const offlineResponse = await caches.match(`${baseUrl}/offline.html`);
            return offlineResponse || new Response(FALLBACK_HTML, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          throw error;
        }
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
      }
    })()
  );
}); 