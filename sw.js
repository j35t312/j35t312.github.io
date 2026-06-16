// ---- Service Worker — Barebones Cache-First PWA ----
// Bump APP_VERSION to match index.html whenever you deploy changes.
const APP_VERSION = '1.0.7';
const CACHE_NAME = `sched-viewer-${APP_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/ical.js@1.5.0/build/ical.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// Install: pre-cache assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// Activate: delete any old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Message handler: FORCE_UPDATE nukes all caches so the next reload fetches fresh
self.addEventListener('message', (event) => {
  if (event.data === 'FORCE_UPDATE') {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach((c) => c.postMessage('RELOAD')))
    );
  }
});
