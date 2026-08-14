/* =====================================================
   DYVE ADMIN — PRODUCTION SERVICE WORKER
   =====================================================

   SERVICE WORKER LOCATION:
   https://www.dyve.online/admin/sw.js

   APPLICATION ROOT:
   https://www.dyve.online/admin/

   ROUTES:
   • /admin/                    → Admin dashboard
   • /admin/index.html          → Admin dashboard
   • /admin/hackax/             → HackaX editor
   • /admin/hackax/index.html   → HackaX editor
   • /admin/tech-editor/        → Tech Editor
   • /admin/tech-editor/index.html → Tech Editor
   • /admin/published.html      → Published articles

   ARCHITECTURE:
   • GitHub API is NEVER intercepted.
   • Non-GET requests are NEVER intercepted.
   • HTML navigation = network-first.
   • Offline navigation = route-aware fallback.
   • articles.json = network-first.
   • GitHub raw content = network-first.
   • Static assets = stale-while-revalidate.
   • CDN assets = stale-while-revalidate.
   • Runtime cache is bounded.
   • Old Dyve Admin caches are removed.
   • Navigation preload is enabled where supported.

   IMPORTANT:
   Publishing requests such as PUT/POST/PATCH/DELETE
   are deliberately left completely untouched.
===================================================== */

const VERSION = '3.0.0';

const ADMIN_ROOT = '/admin/';

const CORE_CACHE = `dyve-admin-core-v${VERSION}`;
const RUNTIME_CACHE = `dyve-admin-runtime-v${VERSION}`;

const MAX_RUNTIME_ENTRIES = 100;

/* =====================================================
   APPLICATION SHELL
===================================================== */

const CORE_ASSETS = [
  '/admin/',
  '/admin/index.html',
  '/admin/manifest.json',
  '/admin/sw.js',
  '/admin/logo.png',
  '/admin/published.html',

  '/admin/hackax/',
  '/admin/hackax/index.html',

  '/admin/tech-editor/',
  '/admin/tech-editor/index.html'
];

/* =====================================================
   ROUTE-AWARE OFFLINE SHELLS
===================================================== */

const ROUTE_SHELLS = [
  {
    test: (url) => {
      const path = normalizePath(url.pathname);

      return (
        path === '/admin/' ||
        path === '/admin/index.html'
      );
    },

    shell: '/admin/index.html'
  },

  {
    test: (url) => {
      const path = normalizePath(url.pathname);

      return (
        path === '/admin/hackax/' ||
        path === '/admin/hackax/index.html'
      );
    },

    shell: '/admin/hackax/index.html'
  },

  {
    test: (url) => {
      const path = normalizePath(url.pathname);

      return (
        path === '/admin/tech-editor/' ||
        path === '/admin/tech-editor/index.html'
      );
    },

    shell: '/admin/tech-editor/index.html'
  },

  {
    test: (url) => {
      const path = normalizePath(url.pathname);

      return path === '/admin/published.html';
    },

    shell: '/admin/published.html'
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
        await Promise.allSettled(
          CORE_ASSETS.map(async (asset) => {
            try {
              const response = await fetch(
                new Request(asset, {
                  cache: 'no-cache'
                })
              );

              if (
                response &&
                (
                  response.ok ||
                  response.type === 'opaque'
                )
              ) {
                await cache.put(
                  asset,
                  response
                );
              }
            } catch (error) {
              console.warn(
                '[Dyve SW] Precache failed:',
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
        const isDyveCache =
          cacheName.startsWith('dyve-admin-core-') ||
          cacheName.startsWith('dyve-admin-runtime-');

        return (
          isDyveCache &&
          !validCaches.has(cacheName)
        );
      })
      .map((cacheName) => {
        return caches.delete(cacheName);
      })
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

  if (!data) {
    return;
  }

  if (
    data === 'SKIP_WAITING' ||
    data.type === 'SKIP_WAITING'
  ) {
    self.skipWaiting();
    return;
  }

  if (
    data === 'CLEAR_RUNTIME_CACHE' ||
    data.type === 'CLEAR_RUNTIME_CACHE'
  ) {
    event.waitUntil(
      caches.delete(RUNTIME_CACHE)
    );

    return;
  }

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
      .filter((cacheName) => {
        return (
          cacheName.startsWith('dyve-admin-core-') ||
          cacheName.startsWith('dyve-admin-runtime-')
        );
      })
      .map((cacheName) => {
        return caches.delete(cacheName);
      })
  );
}

/* =====================================================
   FETCH ROUTER
===================================================== */

self.addEventListener('fetch', (event) => {
  const req = event.request;

  /*
   * NEVER intercept non-GET requests.
   *
   * This keeps publishing completely live.
   */
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  /* ===================================================
     ONLY CONTROL /admin/
  =================================================== */

  if (
    url.origin === self.location.origin &&
    !isAdminPath(url.pathname)
  ) {
    return;
  }

  /* ===================================================
     GITHUB API — NEVER INTERCEPT
  =================================================== */

  if (
    url.hostname === 'api.github.com'
  ) {
    return;
  }

  /*
   * Never intercept GitHub API-like paths on
   * githubusercontent.com either.
   */
  if (
    url.hostname.endsWith('.githubusercontent.com') &&
    url.pathname.includes('/api/')
  ) {
    return;
  }

  /* ===================================================
     PAGE NAVIGATION
  =================================================== */

  if (req.mode === 'navigate') {
    event.respondWith(
      navigationHandler(event, req)
    );

    return;
  }

  /* ===================================================
     ARTICLES DATABASE
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
     RAW GITHUB CONTENT
  =================================================== */

  if (
    NETWORK_FIRST_HOSTS.includes(
      url.hostname
    )
  ) {
    event.respondWith(
      networkFirst(req)
    );

    return;
  }

  /* ===================================================
     STATIC / CDN ASSETS
  =================================================== */

  if (
    CACHEABLE_DESTINATIONS.includes(
      req.destination
    ) ||
    CDN_HOSTS.includes(
      url.hostname
    )
  ) {
    event.respondWith(
      staleWhileRevalidate(req)
    );

    return;
  }
});

/* =====================================================
   PATH NORMALIZATION
===================================================== */

function normalizePath(pathname) {
  if (!pathname) {
    return '/';
  }

  let path = pathname;

  /*
   * Remove duplicate trailing slash except root.
   */
  if (
    path.length > 1 &&
    path.endsWith('/')
  ) {
    path = path.slice(0, -1);
  }

  return path;
}

/* =====================================================
   ADMIN PATH CHECK
===================================================== */

function isAdminPath(pathname) {
  const path =
    normalizePath(pathname);

  return (
    path === '/admin' ||
    path.startsWith('/admin/')
  );
}

/* =====================================================
   ARTICLES REQUEST DETECTION
===================================================== */

function isArticlesRequest(url) {
  const pathname =
    url.pathname.toLowerCase();

  return (
    pathname.endsWith('/articles.json')
  );
}

/* =====================================================
   NAVIGATION HANDLER
===================================================== */

async function navigationHandler(event, req) {
  /*
   * Navigation preload.
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
   * Network first.
   */
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
  }

  /*
   * Exact cache.
   */
  const exactCached =
    await caches.match(req);

  if (exactCached) {
    return exactCached;
  }

  /*
   * Ignore query parameters.
   */
  const ignoredSearch =
    await caches.match(
      req,
      {
        ignoreSearch: true
      }
    );

  if (ignoredSearch) {
    return ignoredSearch;
  }

  /*
   * Route-aware shell.
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

/* =====================================================
   CACHE NAVIGATION RESPONSE
===================================================== */

async function cacheNavigationResponse(
  req,
  response
) {
  try {
    const cache =
      await caches.open(
        CORE_CACHE
      );

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
     * Unknown /admin/ route.
     */
    return caches.match(
      '/admin/index.html'
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
    '/admin/index.html'
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
        {
          ignoreSearch: true
        }
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
   * Instant cached response.
   */
  if (cached) {
    return cached;
  }

  /*
   * First request.
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

    if (
      keys.length <= max
    ) {
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