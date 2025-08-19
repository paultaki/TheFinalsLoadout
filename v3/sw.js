/**
 * Service Worker for The Finals Loadout v3
 * Conservative caching strategy - ONLY caches static assets
 * Never touches JS/CSS to prevent animation issues
 */

const CACHE_NAME = 'finals-loadout-v3-images-v1';
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Only cache these safe asset types
const CACHEABLE_EXTENSIONS = [
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.woff2',
  '.woff',
  '.mp3'
];

// Never cache these paths
const NEVER_CACHE = [
  '/api/',
  'loadouts.json',
  '.js',
  '.css',
  'index.html'
];

self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Check if this should never be cached
  const shouldNeverCache = NEVER_CACHE.some(pattern => 
    url.pathname.includes(pattern)
  );
  
  if (shouldNeverCache) {
    // Always fetch fresh for these
    return;
  }
  
  // Check if this is a cacheable asset
  const isCacheable = CACHEABLE_EXTENSIONS.some(ext => 
    url.pathname.endsWith(ext)
  );
  
  if (!isCacheable) {
    // Not an asset we want to cache
    return;
  }
  
  // Cache-first strategy for images and fonts
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request).then(response => {
          // Don't cache error responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response since we need to use it twice
          const responseToCache = response.clone();
          
          // Add to cache for next time
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Network failed, and nothing in cache
        // For images, we could return a placeholder
        if (url.pathname.includes('/images/')) {
          return caches.match('/images/placeholder.webp');
        }
      })
  );
});

// Periodic cache cleanup (runs when SW wakes up)
self.addEventListener('message', event => {
  if (event.data === 'cleanupCache') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(requests => {
        requests.forEach(request => {
          cache.match(request).then(response => {
            if (response) {
              const dateHeader = response.headers.get('date');
              if (dateHeader) {
                const cacheTime = new Date(dateHeader).getTime();
                const now = Date.now();
                if (now - cacheTime > IMAGE_CACHE_DURATION) {
                  cache.delete(request);
                }
              }
            }
          });
        });
      });
    });
  }
});