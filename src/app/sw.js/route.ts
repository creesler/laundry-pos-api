import { NextResponse } from 'next/server';

const SW_CONTENT = `
const CACHE_NAME = 'laundry-pos-v1';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache initial resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return Promise.all(
          URLS_TO_CACHE.map(url =>
            fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to fetch: ' + url);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error('[ServiceWorker] Failed to cache:', url, error);
                // Continue with other files even if one fails
                return Promise.resolve();
              })
          )
        );
      })
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    Promise.all([
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Fetch failed:', error);
        // Return a default response or handle the error as needed
        return new Response('Offline content not available');
      })
  );
});
`;

export async function GET() {
  return new NextResponse(SW_CONTENT, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
} 