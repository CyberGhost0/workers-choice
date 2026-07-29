const CACHE = 'workers-choice-v1';

const urlsToCache = [
  '.',
  'marketplace/',
  'auth/',
  'chat/',
  'wall/',
  'channels/',
  'dashboard/',
  'profile/',
  'admin/',
  'orders/',
  'reviews/',
  'messages/',
  'cart/',
  'products/',
  'about/',
  'contact/',
  'privacy/',
  'cookies/',
  'dashboard/services/',
  'icons/icon.svg',
  'icons/icon-maskable.svg',
  'manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
