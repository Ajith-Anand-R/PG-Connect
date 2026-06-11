const CACHE_VERSION = 'pgconnect-v9';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/favicon.png'
];

const MAX_DYNAMIC_CACHE = 80;
const MAX_IMAGE_CACHE = 60;
const MAX_API_CACHE = 50;
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Only cache SAFE read-mostly endpoints ──
// These are data that changes infrequently and where stale data is acceptable.
// DO NOT add: payments, tenants, visitors, beds, gate_requests — stale data is dangerous there.
const CACHEABLE_TABLES = [
  'notices',
  'menu_days',
  'community_posts',
  'post_comments',
  'post_likes',
  'parcels',
  'staff_logs',
];

function isCacheableApiRequest(url) {
  // Only cache GET requests to explicitly safe tables
  const pathname = url.pathname;
  return CACHEABLE_TABLES.some(table => pathname.includes(`/rest/v1/${table}`));
}

// ── Install: pre-cache critical static assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ──
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, DYNAMIC_CACHE, FONT_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ── Trim cache to max entries (FIFO) ──
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// ── Check if API cache entry is still fresh ──
function isApiCacheFresh(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  return (Date.now() - parseInt(cachedAt, 10)) < API_CACHE_TTL;
}

// ── Clone response with timestamp header for API cache ──
async function stampResponse(response) {
  const body = await response.blob();
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Fetch handler ──
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests entirely — no background sync (too risky for production:
  // duplicate submissions, Safari incompatibility, conflict resolution needed)
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip localhost — no caching during development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '127.0.51.1') {
    return;
  }

  // ── Strategy 1: Navigation — Network-first with offline fallback ──
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          // Offline: serve cached page or app shell
          const cached = await caches.match(event.request);
          return cached || caches.match('/');
        }
      })()
    );
    return;
  }

  // Skip Next.js RSC data fetches — let Next.js handle its own caching
  if (url.pathname.startsWith('/_next/data/') || url.searchParams.has('_rsc')) {
    return;
  }

  // ── Strategy 2: Supabase API — SELECTIVE SWR for safe read-mostly tables only ──
  // Payments, tenants, visitors, beds, gate_requests are NEVER cached.
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/') && isCacheableApiRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(event.request);

        // Serve fresh cache immediately, revalidate in background
        if (cached && isApiCacheFresh(cached)) {
          fetch(event.request).then(async (response) => {
            if (response && response.status === 200) {
              const stamped = await stampResponse(response);
              cache.put(event.request, stamped);
              trimCache(API_CACHE, MAX_API_CACHE);
            }
          }).catch(() => {});
          return cached;
        }

        // Cache miss or stale: fetch from network
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const stamped = await stampResponse(response);
            cache.put(event.request, stamped);
            trimCache(API_CACHE, MAX_API_CACHE);
          }
          return response;
        } catch {
          // Offline: serve stale cache if available (better than nothing for notices/menu)
          return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })()
    );
    return;
  }

  // ── Strategy 3: Supabase Storage images — Network-first with cache fallback ──
  // Using network-first (NOT cache-first) because profile photos/avatars can be
  // overwritten at the same path. Cache-first would show stale photos.
  // The filenames in this project use Date.now() + random suffix so they're mostly unique,
  // but network-first is the safe default for user-uploaded content.
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(event.request, response.clone());
            trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
          }
          return response;
        } catch {
          // Offline: serve cached image
          const cached = await caches.match(event.request);
          return cached || new Response('', { status: 503 });
        }
      })()
    );
    return;
  }

  // ── Strategy 4: Google Fonts — Cache-first, long-lived ──
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 5: Next.js static assets (_next/static/) — Cache-first (hashed, immutable) ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 6: Local images — Cache-first with eviction ──
  if (event.request.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 7: Stale-while-revalidate for everything else (JS chunks, CSS) ──
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE);
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
