/* =====================================================
   DYVE ADMIN — UNIVERSAL SERVICE WORKER
   Covers: / (admin), /hackax/, /tech-editor/
   Rules:
   • GitHub API is NEVER intercepted (publishing stays live)
   • articles.json + raw GitHub = network-first (fresh, offline fallback)
   • Pages = network-first, then cache, then app shell
   • CDN/static assets = stale-while-revalidate (fast + offline)
===================================================== */
const VERSION = '1.0.0'; // bump this on every deploy to refresh caches
const CORE_CACHE = 'dyve-core-v' + VERSION;
const RUNTIME_CACHE = 'dyve-runtime-v' + VERSION;
const MAX_RUNTIME_ENTRIES = 80;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './logo.png',
  './published.html',
  './hackax/index.html',
  './tech-editor/index.html'
];

const NETWORK_FIRST_HOSTS = ['raw.githubusercontent.com'];
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.quilljs.com',
  'images.unsplash.com',
  'res.cloudinary.com'
];
const CACHEABLE_DESTINATIONS = ['style', 'script', 'font', 'image'];

/* ---------- LIFECYCLE ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      // allSettled: one missing file can't break the whole install
      .then((cache) => Promise.allSettled(CORE_ASSETS.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CORE_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_RUNTIME_CACHE') caches.delete(RUNTIME_CACHE);
});

/* ---------- REQUEST ROUTING ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never touch POST/PUT/DELETE (publishing)

  const url = new URL(req.url);

  // 1) GitHub API: always live, never cached
  if (url.hostname === 'api.github.com') return;

  // 2) Page navigations: network → cache → shell
  if (req.mode === 'navigate') {
    event.respondWith(navigationHandler(req));
    return;
  }

  // 3) Article database + raw GitHub deltas: network-first
  if (url.pathname.endsWith('articles.json') || NETWORK_FIRST_HOSTS.includes(url.hostname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 4) Static + CDN assets: stale-while-revalidate
  if (CACHEABLE_DESTINATIONS.includes(req.destination) || CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

/* ---------- STRATEGIES ---------- */
async function navigationHandler(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(CORE_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    const shell = await caches.match('./index.html');
    if (shell) return shell;
    return new Response('Offline — this page is not cached yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === 'opaque')) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    return new Response(null, { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(req) {
  const isSameOrigin = new URL(req.url).origin === self.location.origin;
  const cacheName = isSameOrigin ? CORE_CACHE : RUNTIME_CACHE;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const update = fetch(req).then((fresh) => {
    if (fresh && (fresh.ok || fresh.type === 'opaque')) {
      cache.put(req, fresh.clone()).then(() => {
        if (cacheName === RUNTIME_CACHE) trimCache(cache, MAX_RUNTIME_ENTRIES);
      });
    }
    return fresh;
  }).catch(() => null);

  if (cached) return cached;          // instant, refresh in background
  const fresh = await update;         // nothing cached: wait for network
  return fresh || new Response(null, { status: 503 });
}

async function trimCache(cache, max) {
  try {
    const keys = await cache.keys();
    if (keys.length > max) {
      await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
    }
  } catch (e) { /* non-fatal */ }
}
