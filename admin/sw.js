/* =====================================================
   DYVE ADMIN — PRODUCTION SERVICE WORKER
   =====================================================

   Coverage:
   • /                 → Dyve Admin
   • /hackax/          → HackaX editor
   • /tech-editor/     → Tech Editor

   Architecture:
   • GitHub API is NEVER intercepted.
   • Non-GET requests are NEVER intercepted.
   • HTML navigation = network-first.
   • Offline navigation = route-aware cache fallback.
   • articles.json = network-first.
   • GitHub raw content = network-first.
   • Same-origin static assets = stale-while-revalidate.
   • CDN assets = stale-while-revalidate.
   • Runtime cache is automatically bounded.
   • Old application caches are removed on activation.
   • Navigation preload is enabled where supported.

   IMPORTANT:
   Publishing requests such as PUT/POST/PATCH/DELETE
   are deliberately left completely untouched.
===================================================== */

const VERSION = '2.0.0';

const CORE_CACHE = `dyve-admin-core-v${VERSION}`;
const RUNTIME_CACHE = `dyve-admin-runtime-v${VERSION}`;

const MAX_RUNTIME_ENTRIES = 100;

/* =====================================================
   APPLICATION SHELL
===================================================== */

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './logo.png',
  './published.html',

  './hackax/',
  './hackax/index.html',

  './tech-editor/',
  './tech-editor/index.html'
];

/* =====================================================
   ROUTE-AWARE OFFLINE SHELLS
===================================================== */

const ROUTE_SHELLS = [
  {
    test: (url) =>
      url.pathname === '/admin/' ||
      url.pathname === '/admin/index.html',
    shell: './index.html'
  },

  {
    test: (url) =>
      url.pathname === '/admin/hackax/' ||
      url.pathname === '/admin/hackax/index.html',
    shell: './hackax/index.html'
  },

  {
    test: (url) =>
      url.pathname === '/admin/tech-editor/' ||
      url.pathname === '/admin/tech-editor/index.html',
    shell: './tech-editor/index.html'
  }
];
/* =====================================================
   NETWORK-FIRST HOSTS
===================================================== */

const NETWORK_FIRST_HOSTS = [
  'raw.githubusercontent.com'
];

/* =====================================================
   CDN / EXTERNAL STATIC HOSTS
===================================================== */

const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.quilljs.com',
  'images.unsplash.com',
  'res.cloudinary.com'
];

/* =====================================================
   CACHEABLE REQUEST DESTINATIONS
===================================================== */

const CACHEABLE_DESTINATIONS = [
  'style',
  'script',
  'font',
  'image'
];

/* =====================================================
   INSTALL
===================================================== */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(async (cache) => {
        /*
         * Cache assets individually.
         * One missing/non-critical asset must not prevent
         * the entire service worker from installing.
         */
        await Promise.allSettled(
          CORE_ASSETS.map(async (asset) => {
            try {
              await cache.add(asset);
            } catch (error) {
              console.warn(
                '[Dyve SW] Failed to precache:',
                asset,
                error
              );
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      enableNavigationPreload()
    ])
      .then(() => self.clients.claim())
  );
});

/* =====================================================
   OLD CACHE CLEANUP
===================================================== */

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();

  const validCaches = new Set([
    CORE_CACHE,
    RUNTIME_CACHE
  ]);

  await Promise.all(
    cacheNames
      .filter((cacheName) => {
        /*
         * Only remove caches belonging to Dyve Admin.
         * Never touch unrelated application caches.
         */
        const isDyveCache =
          cacheName.startsWith('dyve-admin-core-') ||
          cacheName.startsWith('dyve-admin-runtime-');

        return isDyveCache && !validCaches.has(cacheName);
      })
      .map((cacheName) => caches.delete(cacheName))
  );
}

/* =====================================================
   NAVIGATION PRELOAD
===================================================== */

async function enableNavigationPreload() {
  if (
    self.registration.navigationPreload &&
    typeof self.registration.navigationPreload.enable === 'function'
  ) {
    try {
      await self.registration.navigationPreload.enable();
    } catch (error) {
      console.warn(
        '[Dyve SW] Navigation preload unavailable:',
        error
      );
    }
  }
}

/* =====================================================
   CLIENT MESSAGES
===================================================== */

self.addEventListener('message', (event) => {
  const data = event.data;

  if (!data) return;

  /*
   * Force the waiting service worker to activate.
   */
  if (
    data === 'SKIP_WAITING' ||
    data.type === 'SKIP_WAITING'
  ) {
    self.skipWaiting();
    return;
  }

  /*
   * Delete runtime content only.
   * Core application assets remain intact.
   */
  if (
    data === 'CLEAR_RUNTIME_CACHE' ||
    data.type === 'CLEAR_RUNTIME_CACHE'
  ) {
    event.waitUntil(
      caches.delete(RUNTIME_CACHE)
    );
    return;
  }

  /*
   * Full application cache reset.
   * Useful from Settings / maintenance controls.
   */
  if (
    data === 'CLEAR_ALL_CACHES' ||
    data.type === 'CLEAR_ALL_CACHES'
  ) {
    event.waitUntil(
      clearDyveCaches()
    );
  }
});

/* =====================================================
   FULL CACHE RESET
===================================================== */

async function clearDyveCaches() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) =>
        cacheName.startsWith('dyve-admin-core-') ||
        cacheName.startsWith('dyve-admin-runtime-')
      )
      .map((cacheName) =>
        caches.delete(cacheName)
      )
  );
}

/* =====================================================
   FETCH ROUTER
===================================================== */

self.addEventListener('fetch', (event) => {
  const req = event.request;

  /*
   * Only GET requests are eligible.
   *
   * This is critical:
   * publishing operations must never be intercepted.
   */
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  /* ===================================================
     1. GITHUB API — NEVER INTERCEPT
  =================================================== */

  if (
    url.hostname === 'api.github.com' ||
    url.hostname.endsWith('.githubusercontent.com') &&
    url.pathname.includes('/api/')
  ) {
    return;
  }

  /* ===================================================
     2. PAGE NAVIGATION
  =================================================== */

  if (req.mode === 'navigate') {
    event.respondWith(
      navigationHandler(event, req)
    );
    return;
  }

  /* ===================================================
     3. ARTICLES DATABASE
  =================================================== */

  if (
    isArticlesRequest(url)
  ) {
    event.respondWith(
      networkFirst(req)
    );
    return;
  }

  /* ===================================================
     4. RAW GITHUB CONTENT
  =================================================== */

  if (
    NETWORK_FIRST_HOSTS.includes(url.hostname)
  ) {
    event.respondWith(
      networkFirst(req)
    );
    return;
  }

  /* ===================================================
     5. STATIC / CDN ASSETS
  =================================================== */

  if (
    CACHEABLE_DESTINATIONS.includes(req.destination) ||
    CDN_HOSTS.includes(url.hostname)
  ) {
    event.respondWith(
      staleWhileRevalidate(req)
    );
    return;
  }

  /*
   * Everything else remains browser-controlled.
   */
});

/* =====================================================
   ARTICLES REQUEST DETECTION
===================================================== */

function isArticlesRequest(url) {
  const pathname = url.pathname.toLowerCase();

  return (
    pathname.endsWith('/articles.json') ||
    pathname.endsWith('articles.json')
  );
}

/* =====================================================
   NAVIGATION HANDLER
===================================================== */

async function navigationHandler(event, req) {
  /*
   * Navigation preload can provide the network response
   * before the service worker finishes bootstrapping.
   */
  try {
    const preloadResponse =
      event.preloadResponse
        ? await event.preloadResponse
        : null;

    if (
      preloadResponse &&
      preloadResponse.ok
    ) {
      await cacheNavigationResponse(
        req,
        preloadResponse.clone()
      );

      return preloadResponse;
    }
  } catch (error) {
    console.warn(
      '[Dyve SW] Navigation preload failed:',
      error
    );
  }

  /*
   * Standard network-first navigation.
   */
  try {
    const fresh = await fetch(req);

    if (
      fresh &&
      (
        fresh.ok ||
        fresh.type === 'opaque'
      )
    ) {
      await cacheNavigationResponse(
        req,
        fresh.clone()
      );
    }

    return fresh;
  } catch (error) {
    console.warn(
      '[Dyve SW] Navigation network failed:',
      req.url
    );

    /*
     * First attempt exact navigation cache.
     */
    const exactCached =
      await caches.match(req);

    if (exactCached) {
      return exactCached;
    }

    /*
     * Then attempt search-cache matching.
     */
    const ignoredSearch =
      await caches.match(
        req,
        { ignoreSearch: true }
      );

    if (ignoredSearch) {
      return ignoredSearch;
    }

    /*
     * Finally use the correct application shell
     * for the current route.
     */
    const shell =
      await getOfflineShell(
        new URL(req.url)
      );

    if (shell) {
      return shell;
    }

    return offlineResponse();
  }
}

/* =====================================================
   CACHE NAVIGATION RESPONSE
===================================================== */

async function cacheNavigationResponse(
  req,
  response
) {
  try {
    const cache =
      await caches.open(CORE_CACHE);

    await cache.put(
      req,
      response
    );
  } catch (error) {
    console.warn(
      '[Dyve SW] Navigation cache failed:',
      error
    );
  }
}

/* =====================================================
   OFFLINE SHELL RESOLUTION
===================================================== */

async function getOfflineShell(url) {
  const route =
    ROUTE_SHELLS.find(
      (item) => item.test(url)
    );

  if (!route) {
    /*
     * Unknown route:
     * use the main admin shell.
     */
    return caches.match(
      './index.html'
    );
  }

  const cached =
    await caches.match(
      route.shell
    );

  if (cached) {
    return cached;
  }

  return caches.match(
    './index.html'
  );
}

/* =====================================================
   NETWORK FIRST
===================================================== */

async function networkFirst(req) {
  try {
    const fresh =
      await fetch(req);

    if (
      fresh &&
      (
        fresh.ok ||
        fresh.type === 'opaque'
      )
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      await cache.put(
        req,
        fresh.clone()
      );

      await trimCache(
        cache,
        MAX_RUNTIME_ENTRIES
      );
    }

    return fresh;
  } catch (error) {
    const cached =
      await caches.match(
        req,
        { ignoreSearch: true }
      );

    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({
        offline: true,
        message:
          'Dyve Admin is offline and this resource is not cached.'
      }),
      {
        status: 503,
        headers: {
          'Content-Type':
            'application/json; charset=utf-8',
          'Cache-Control':
            'no-store'
        }
      }
    );
  }
}

/* =====================================================
   STALE WHILE REVALIDATE
===================================================== */

async function staleWhileRevalidate(req) {
  const url =
    new URL(req.url);

  const isSameOrigin =
    url.origin === self.location.origin;

  const cacheName =
    isSameOrigin
      ? CORE_CACHE
      : RUNTIME_CACHE;

  const cache =
    await caches.open(
      cacheName
    );

  const cached =
    await cache.match(req);

  const update =
    fetch(req)
      .then(async (fresh) => {
        if (
          fresh &&
          (
            fresh.ok ||
            fresh.type === 'opaque'
          )
        ) {
          try {
            await cache.put(
              req,
              fresh.clone()
            );

            if (
              cacheName ===
              RUNTIME_CACHE
            ) {
              await trimCache(
                cache,
                MAX_RUNTIME_ENTRIES
              );
            }
          } catch (error) {
            console.warn(
              '[Dyve SW] Asset cache update failed:',
              error
            );
          }
        }

        return fresh;
      })
      .catch(() => null);

  /*
   * Cached response wins immediately.
   */
  if (cached) {
    return cached;
  }

  /*
   * No cache:
   * wait for the network.
   */
  const fresh =
    await update;

  if (fresh) {
    return fresh;
  }

  return new Response(
    '',
    {
      status: 503,
      statusText: 'Offline'
    }
  );
}

/* =====================================================
   CACHE SIZE MANAGEMENT
===================================================== */

async function trimCache(
  cache,
  max
) {
  try {
    const keys =
      await cache.keys();

    if (keys.length <= max) {
      return;
    }

    const excess =
      keys.length - max;

    const removals =
      keys.slice(
        0,
        excess
      );

    await Promise.all(
      removals.map(
        (request) =>
          cache.delete(request)
      )
    );
  } catch (error) {
    /*
     * Cache trimming is non-critical.
     */
    console.warn(
      '[Dyve SW] Cache trimming failed:',
      error
    );
  }
}

/* =====================================================
   OFFLINE RESPONSE
===================================================== */

function offlineResponse() {
  return new Response(
    `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
          >
          <meta
            name="theme-color"
            content="#020403"
          >
          <title>Dyve Admin — Offline</title>
          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              min-height: 100%;
              background: #020403;
              color: #e8f0ee;
              font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
            }

            body {
              min-height: 100vh;
              display: grid;
              place-items: center;
              padding: 24px;
            }

            main {
              width: 100%;
              max-width: 420px;
              padding: 28px;
              border: 1px solid rgba(255,255,255,.08);
              border-radius: 20px;
              background:
                linear-gradient(
                  145deg,
                  rgba(20,35,31,.95),
                  rgba(3,7,6,.98)
                );
              box-shadow:
                0 24px 70px rgba(0,0,0,.55);
            }

            .eyebrow {
              margin-bottom: 12px;
              color: #c6a85a;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            h1 {
              margin: 0;
              font-size: 28px;
              line-height: 1.15;
            }

            p {
              margin: 14px 0 0;
              color: #9aa8a4;
              font-size: 15px;
              line-height: 1.6;
            }

            button {
              width: 100%;
              margin-top: 22px;
              padding: 13px 16px;
              border: 0;
              border-radius: 10px;
              background: #e8f0ee;
              color: #020403;
              font: inherit;
              font-weight: 700;
              cursor: pointer;
            }
          </style>
        </head>

        <body>
          <main>
            <div class="eyebrow">
              DYVE ADMIN
            </div>

            <h1>
              You're offline.
            </h1>

            <p>
              This workspace could not load the requested
              page from the local application cache.
              Reconnect and try again.
            </p>

            <button
              type="button"
              onclick="location.reload()"
            >
              Try Again
            </button>
          </main>
        </body>
      </html>
    `,
    {
      status: 503,
      headers: {
        'Content-Type':
          'text/html; charset=utf-8',
        'Cache-Control':
          'no-store'
      }
    }
  );
}