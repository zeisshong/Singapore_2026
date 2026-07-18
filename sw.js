const CACHE_VERSION = 'dino-sg-v12';

const APP_SHELL = [
  './',
  './index.html',
  './singapore_expense_2026.html',
  './css/modern.css',
  './js/app.js',
  './manifest.webmanifest',

  './assets/dino/dino-transparent.png',
  './assets/dino/dino-hero-camera.png',
  './assets/dino/dino-map-guide.png',
  './assets/dino/dino-budget-wallet.png',
  './assets/dino/dino-mrt-card.png',
  './assets/dino/dino-private-lock.png',
  './assets/dino/dino-heat-drink.png',

  './images/Singapore_MRT_System_Map.webp',
  './images/sg_railway.jpg',
  './images/uss-park-map.webp',

  './images/sg-tpe_flight.png',
  './images/tpe-sg_flight.png',
  './images/universal_studio_singapore.png'
];

const HTML_FALLBACK = './index.html';

self.addEventListener(
  'install',
  (event) => {
    event.waitUntil(
      caches
        .open(CACHE_VERSION)
        .then(async (cache) => {
          const results =
            await Promise.allSettled(
              APP_SHELL.map(
                async (asset) => {
                  const request =
                    new Request(asset, {
                      cache: 'reload'
                    });

                  const response =
                    await fetch(request);

                  if (!response.ok) {
                    throw new Error(
                      `Unable to cache ${asset}`
                    );
                  }

                  await cache.put(
                    request,
                    response
                  );
                }
              )
            );

          results
            .filter(
              (result) =>
                result.status ===
                'rejected'
            )
            .forEach((result) => {
              console.warn(
                'Precache failed:',
                result.reason
              );
            });
        })
        .then(() => self.skipWaiting())
    );
  }
);

self.addEventListener(
  'activate',
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => {
          return Promise.all(
            keys
              .filter(
                (key) =>
                  key !== CACHE_VERSION
              )
              .map((key) =>
                caches.delete(key)
              )
          );
        })
        .then(() =>
          self.clients.claim()
        )
    );
  }
);

self.addEventListener(
  'fetch',
  (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
      return;
    }

    const url = new URL(request.url);

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      return;
    }

    if (
      request.mode === 'navigate'
    ) {
      event.respondWith(
        networkFirstPage(request)
      );

      return;
    }

    if (
      url.origin !==
      self.location.origin
    ) {
      event.respondWith(
        networkWithCacheFallback(
          request
        )
      );

      return;
    }

    const destination =
      request.destination;

    if (
      destination === 'image' ||
      destination === 'font'
    ) {
      event.respondWith(
        cacheFirst(request)
      );

      return;
    }

    if (
      destination === 'style' ||
      destination === 'script'
    ) {
      event.respondWith(
        staleWhileRevalidate(request)
      );

      return;
    }

    event.respondWith(
      cacheFirst(request)
    );
  }
);

async function networkFirstPage(
  request
) {
  const cache =
    await caches.open(
      CACHE_VERSION
    );

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok
    ) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    const cached =
      await caches.match(request);

    if (cached) {
      return cached;
    }

    const fallback =
      await caches.match(
        HTML_FALLBACK
      );

    if (fallback) {
      return fallback;
    }

    return new Response(
      '目前沒有網路連線，且此頁尚未完成離線快取。',
      {
        status: 503,
        headers: {
          'Content-Type':
            'text/plain; charset=utf-8'
        }
      }
    );
  }
}

async function cacheFirst(request) {
  const cached =
    await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok
    ) {
      const cache =
        await caches.open(
          CACHE_VERSION
        );

      await cache.put(
        request,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    if (
      request.destination ===
      'document'
    ) {
      const fallback =
        await caches.match(
          HTML_FALLBACK
        );

      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
}

async function staleWhileRevalidate(
  request
) {
  const cache =
    await caches.open(
      CACHE_VERSION
    );

  const cached =
    await cache.match(request);

  const networkRequest =
    fetch(request)
      .then(async (response) => {
        if (
          response &&
          response.ok
        ) {
          await cache.put(
            request,
            response.clone()
          );
        }

        return response;
      })
      .catch(() => null);

  if (cached) {
    eventWaitUntilSafe(
      networkRequest
    );

    return cached;
  }

  const response =
    await networkRequest;

  if (response) {
    return response;
  }

  throw new Error(
    'Network and cache unavailable.'
  );
}

async function networkWithCacheFallback(
  request
) {
  const cache =
    await caches.open(
      CACHE_VERSION
    );

  try {
    const response =
      await fetch(request);

    if (
      response &&
      response.ok &&
      response.type !== 'opaque'
    ) {
      await cache.put(
        request,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    const cached =
      await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

function eventWaitUntilSafe(
  promise
) {
  promise.catch(() => {});
}
