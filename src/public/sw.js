/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({
  debug: false  // Disable debug mode in production
});

const { registerRoute, NavigationRoute, setDefaultHandler } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { precacheAndRoute } = workbox.precaching;

// Initialize precaching with the webpack-injected manifest
precacheAndRoute(self.__WB_MANIFEST);

// Handle navigation requests with Network-First strategy
const navigationHandler = new NetworkFirst({
  cacheName: 'navigations',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

registerRoute(
  ({ request }) => request.mode === 'navigate',
  navigationHandler
);

// Cache story data with StaleWhileRevalidate and custom offline fallback
const storiesHandler = new StaleWhileRevalidate({
  cacheName: 'stories-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
});

// Handle stories API requests
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/stories'),
  async (options) => {
    try {
      // Try to get from network/cache using StaleWhileRevalidate
      const response = await storiesHandler.handle(options);
      return response;
    } catch (error) {
      // If offline, try to get from cache directly
      const cache = await caches.open('stories-cache');
      const cachedResponse = await cache.match(options.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If no cached data, return empty stories array with offline message
      return new Response(
        JSON.stringify({
          error: false,
          message: 'Offline Mode',
          stories: [],
          listStory: [] // Add this for compatibility
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
);

// Cache story images with CacheFirst
registerRoute(
  ({ request, url }) => 
    (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/')) ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache other API responses with NetworkFirst
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Cache static assets (CSS, JS, Fonts) with StaleWhileRevalidate
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Fallback handler for failed requests
const fallbackHandler = async ({ request }) => {
  // For images
  if (request.destination === 'image') {
    const cachedImage = await caches.match(request);
    if (cachedImage) {
      return cachedImage;
    }
    return caches.match('/dstory/icons/icon-192x192.png');
  }

  // For stories API requests
  if (request.url.includes('/stories')) {
    const cache = await caches.open('stories-cache');
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({
        error: false,
        message: 'Offline Mode',
        stories: [],
        listStory: [] // Add this for compatibility
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // For navigation requests
  if (request.mode === 'navigate') {
    const cache = await caches.open('navigations');
    const cachedPage = await cache.match(request);
    if (cachedPage) {
      return cachedPage;
    }
    return await caches.match('/dstory/index.html');
  }

  return Response.error();
};

// Set default handler and catch handler
setDefaultHandler(new NetworkOnly());

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || event.request.url.includes('/stories')) {
    event.respondWith(
      (async () => {
        try {
          // Try preloaded response first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Try normal request handling
          if (event.request.mode === 'navigate') {
            return await navigationHandler.handle({ request: event.request });
          } else if (event.request.url.includes('/stories')) {
            return await storiesHandler.handle({ request: event.request });
          }

          // If all fails, use fallback
          return await fallbackHandler({ request: event.request });
        } catch (error) {
          return await fallbackHandler({ request: event.request });
        }
      })()
    );
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => ![
              'navigations',
              'stories-cache',
              'images-cache',
              'api-cache',
              'static-assets'
            ].includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'DStory',
    body: 'Ada pembaruan baru'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/dstory/icons/icon-192x192.png',
      badge: '/dstory/icons/icon-192x192.png',
      data: {
        url: data.url || '/dstory/'
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});