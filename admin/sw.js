const CACHE_NAME = 'dyve-dashboard-v1';
const urlsToCache = [
  '/admin/',
  '/admin/index.html',
  '/admin/drafts.html',
  '/admin/published.html',
  '/admin/settings.html',
  '/admin/manifest.json',
  '/style.css',
  '/divider.css',
  'https://cdn.tailwindcss.com',
  'https://cdn.quilljs.com/1.3.7/quill.min.js',
  'https://cdn.quilljs.com/1.3.7/quill.snow.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Cache failed:', err);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients
  self.clients.claim();
});

// Fetch strategy: Network First, then Cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response for cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // Show offline page if available
          return caches.match('/admin/');
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Dyve Dashboard SW loaded');
