const CACHE_NAME = 'sched-viewer-v9'; // Increment this version (v1 -> v2) whenever you deploy updates!
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/data/schedule48x48.png',
  './assets/data/schedule512x512.png',
  'https://cdn.jsdelivr.net/npm/ical.js@1.5.0/build/ical.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// Install Event - Pre-cache essential layout shells
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Force activation without waiting for tab closure
  );
});

// Activate Event - Instantly purge old legacy caches across open browser tabs
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old PWA cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Instantly control all open tabs
  );
});

// Fetch Event - Network-First for HTML, Cache-First for static assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Strategy: Network-First for index.html or root page queries
  if (url.origin === self.location.origin && (url.pathname === '/' || url.pathname.endsWith('index.html'))) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          // Update the cache with the fresh version
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request)) // Offline fallback
    );
  } else {
    // Strategy: Cache-First for everything else (Scripts, Styles, Fonts, Images)
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request);
      })
    );
  }
});

// Listener to handle forced upgrade updates dispatched from index.html
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});