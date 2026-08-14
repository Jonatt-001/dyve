/* =====================================================
   DYVE ADMIN — PRODUCTION SERVICE WORKER
   =====================================================

   Actual application scope:

   https://www.dyve.online/admin/

   Routes:
   • /admin/                  → Dyve Admin
   • /admin/index.html        → Dyve Admin
   • /admin/hackax/           → HackaX editor
   • /admin/hackax/index.html → HackaX editor
   • /admin/tech-editor/      → Tech Editor
   • /admin/tech-editor/index.html
                              → Tech Editor
   • /admin/published.html    → Published content
   • /admin/drafts.html       → Draft workspace
   • /admin/settings.html     → Admin settings

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
   • Old Dyve Admin caches are removed on activation.
   • Navigation preload is enabled where supported.

   IMPORTANT:
   Publishing requests such as PUT/POST/PATCH/DELETE
   are deliberately left completely untouched.
===================================================== */

const VERSION = '2.1.0';

const CORE_CACHE = `dyve-admin-core-v${VERSION}`;
const RUNTIME_CACHE = `dyve-admin-runtime-v${VERSION}`;

const MAX_RUNTIME_ENTRIES = 100;

/* =====================================================
   APPLICATION SCOPE
===================================================== */

/*
 * The worker is installed from:
 *
 * https://www.dyve.online/admin/sw.js
 *
 * Therefore the registration scope is:
 *
 * https://www.dyve.online/admin/
 *
 * We deliberately derive the scope dynamically instead
 * of hardcoding "/admin/" so relative routing remains
 * portable and consistent with the existing application.
 */
const ADMIN_SCOPE =
  new URL('./', self.registration.scope);

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
  './drafts.html',
  './settings.html',

  './hackax/',
  './hackax/index.html',

  './tech-editor/',
  './tech-editor/index.html'
];

/* =====================================================
   ROUTE-AWARE OFFLINE SHELLS
===================================================== */

/*
 * IMPORTANT:
 *
 * These paths are deliberately relative.
 *
 * Because this worker lives under /admin/:
 *
 * ./index.html
 *     → /admin/index.html
 *
 * ./hackax/index.html
 *     → /admin/hackax/index.html
 *
 * ./tech-editor/index.html
 *     → /admin/tech-editor/index.html
 */
const ROUTE_SHELLS = [
  {
    route: 'admin',
    shell: './index.html'
  },

  {
    route: 'hackax',
    shell: './hackax/index.html'
  },

  {
    route: 'tech-editor',
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
         *
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
         *
         * Never touch caches belonging to unrelated
         * applications installed on the same origin.
         */
        const isDyveCache =
          cacheName.startsWith('dyve-admin-core-') ||
          cacheName.startsWith('dyve-admin-runtime-');

        return (
          isDyveCache &&
          !validCaches.has(cacheName)
        );
      })
      .map((cacheName) =>
        caches.delete(cacheName)
      )
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
   *
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
   * Full Dyve Admin cache reset.
   *
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
   *
   * PUT / POST / PATCH / DELETE requests are never
   * intercepted by this service worker.
   *
   * Publishing therefore continues directly to GitHub.
   */
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  /* ===================================================
     1. GITHUB API — NEVER INTERCEPT
  =================================================== */

  if (url.hostname === 'api.github.com') {
    return;
  }

  /*
   * Keep GitHub API/publishing completely outside the
   * service-worker request pipeline.
   *
   * This additional guard protects against unusual
   * GitHub-hosted API-style paths.
   */
  if (
    url.hostname.endsWith('.githubusercontent.com') &&
    url.pathname.includes('/api/')
  ) {
    return;
  }

  /* ===================================================
     2. PAGE NAVIGATION
  =================================================== */

  if (req.mode === 'navigate') {
    /*
     * Only handle same-origin Admin navigation.
     *
     * This prevents the Admin worker from becoming
     * responsible for unrelated external destinations.
     */
    if (url.origin !== ADMIN_SCOPE.origin) {
      return;
    }

    if (!isWithinAdminScope(url)) {
      return;
    }

    event.respondWith(
      navigationHandler(event, req)
    );

    return;
  }

  /* ===================================================
     3. ARTICLES DATABASE
  =================================================== */

  if (isArticlesRequest(url)) {
    event.respondWith(
      networkFirst(req)
    );

    return;
  }

  /* ===================================================
     4. RAW GITHUB CONTENT
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
     5. STATIC / CDN ASSETS
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

  /*
   * Everything else remains browser-controlled.
   */
});

/* =====================================================
   ADMIN SCOPE CHECK
===================================================== */

function isWithinAdminScope(url) {
  const scopePath =
    normalizePath(
      ADMIN_SCOPE.pathname
    );

  const requestPath =
    normalizePath(
      url.pathname
    );

  if (scopePath === '/') {
    return true;
  }

  return (
    requestPath === scopePath ||
    requestPath.startsWith(
      scopePath + '/'
    )
  );
}

/* =====================================================
   PATH NORMALIZATION
===================================================== */

function normalizePath(pathname) {
  if (!pathname) {
    return '/';
  }

  let normalized =
    pathname.replace(
      /\/+/g,
      '/'
    );

  if (
    normalized.length > 1 &&
    normalized.endsWith('/')
  ) {
    normalized =
      normalized.slice(
        0,
        -1
      );
  }

  return normalized;
}

/* =====================================================
   ADMIN ROUTE RESOLUTION
===================================================== */

/*
 * Converts:

 * /admin/
 * /admin/index.html

 * into:
 * admin

 *
 * Converts:

 * /admin/hackax/
 * /admin/hackax/index.html

 * into:
 * hackax

 *
 * Converts:

 * /admin/tech-editor/
 * /admin/tech-editor/index.html

 * into:
 * tech-editor
 */
function getAdminRoute(url) {
  if (
    url.origin !== ADMIN_SCOPE.origin
  ) {
    return null;
  }

  const scopePath =
    normalizePath(
      ADMIN_SCOPE.pathname
    );

  const requestPath =
    normalizePath(
      url.pathname
    );

  if (
    requestPath !== scopePath &&
    !requestPath.startsWith(
      scopePath + '/'
    )
  ) {
    return null;
  }

  let relativePath =
    requestPath.slice(
      scopePath.length
    );

  relativePath =
    relativePath.replace(
      /^\/+/,
      ''
    );

  if (
    relativePath === '' ||
    relativePath === 'index.html'
  ) {
    return 'admin';
  }

  if (
    relativePath === 'hackax' ||
    relativePath === 'hackax/index.html'
  ) {
    return 'hackax';
  }

  if (
    relativePath === 'tech-editor' ||
    relativePath === 'tech-editor/index.html'
  ) {
    return 'tech-editor';
  }

  return null;
}

/* =====================================================
   ARTICLES REQUEST DETECTION
===================================================== */

function isArticlesRequest(url) {
  const pathname =
    url.pathname.toLowerCase();

  return (
    pathname.endsWith(
      '/articles.json'
    ) ||
    pathname === 'articles.json'
  );
}

/* =====================================================
   NAVIGATION HANDLER
===================================================== */

async function navigationHandler(
  event,
  req
) {
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

  /* ===================================================
     NETWORK-FIRST NAVIGATION
  =================================================== */

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

  /* ===================================================
     EXACT CACHE
  =================================================== */

  const exactCached =
    await caches.match(req);

  if (exactCached) {
    return exactCached;
  }

  /* ===================================================
     CACHE WITHOUT QUERY STRING
  =================================================== */

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

  /* ===================================================
     ROUTE-AWARE APPLICATION SHELL
  =================================================== */

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
  /*
   * Only cache valid responses.
   *
   * Never poison the navigation cache with a 404,
   * 500 or other failed response.
   */
  if (
    !response ||
    (
      !response.ok &&
      response.type !== 'opaque'
    )
  ) {
    return;
  }

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
  const routeName =
    getAdminRoute(url);

  /*
   * Known Admin route.
   */
  if (routeName) {
    const route =
      ROUTE_SHELLS.find(
        (item) =>
          item.route === routeName
      );

    if (route) {
      const cached =
        await caches.match(
          route.shell
        );

      if (cached) {
        return cached;
      }
    }
  }

  /*
   * Unknown Admin route:
   *
   * Preserve the existing architecture and use the
   * Admin application shell as the final fallback.
   */
  const adminShell =
    await caches.match(
      './index.html'
    );

  if (adminShell) {
    return adminShell;
  }

  return null;
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
    url.origin ===
    self.location.origin;

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

  /*
   * Background refresh.
   */
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
   * Nothing cached:
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
      statusText: 'Offline',
      headers: {
        'Cache-Control':
          'no-store'
      }
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
          cache.delete(
            request
          )
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

          <meta
            name="robots"
            content="noindex,nofollow"
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

              border: 1px solid
                rgba(255,255,255,.08);

              border-radius: 20px;

              background:
                linear-gradient(
                  145deg,
                  rgba(20,35,31,.95),
                  rgba(3,7,6,.98)
                );

              box-shadow:
                0 24px 70px
                rgba(0,0,0,.55);
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

            button:active {
              transform: scale(.98);
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
              This workspace could not load the
              requested page from the local
              application cache. Reconnect and
              try again.
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