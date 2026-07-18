const CACHE = 'dino-sg-v11';

const ASSETS = [
  './',
  './index.html',
  './singapore_expense_2026.html',
  './css/modern.css',
  './js/app.js',
  './manifest.webmanifest',
  './assets/hero/singapore-2026-hero.png',
  './assets/dino/dino-guide.svg',
  './assets/dino/dino-transparent.png',
  './assets/dino/dino-hero-camera.png',
  './assets/dino/dino-map-guide.png',
  './assets/dino/dino-budget-wallet.png',
  './assets/dino/dino-mrt-card.png',
  './assets/dino/dino-private-lock.png',
  './assets/dino/dino-heat-drink.png',
  './images/Singapore_MRT_System_Map.webp',
  './images/sg-tpe_flight.png',
  './images/sg_railway.jpg',
  './images/tpe-sg_flight.png',
  './images/universal_studio_singapore.png',
  './images/uss-park-map.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const clonedResponse = networkResponse.clone();

          caches.open(CACHE).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html');
        });
    })
  );
});
