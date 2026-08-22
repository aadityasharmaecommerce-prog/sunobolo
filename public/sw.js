/**
 * SunoBolo English — Service Worker
 *
 * Caching strategy (v3 — fixed stale CSS after deploy):
 * - HTML navigation: Network-first (never serve stale HTML)
 * - CSS/JS: Network-first (prevents broken styling after deploy)
 * - Audio files: Cache-first with network fallback (large MP3s)
 * - Images/icons: Cache-first (stable assets)
 * - API / auth / payment: NEVER cached
 *
 * Security:
 * - Never caches private user data, auth tokens, or payment responses
 * - Never caches POST requests or sensitive endpoints
 */

const CACHE_NAME = 'sunobolo-v3';
const AUDIO_CACHE = 'sunobolo-audio-v3';
const IMAGE_CACHE = 'sunobolo-images-v3';

// Paths that should NEVER be cached
const NEVER_CACHE = [
  '/api/',
  '/login',
  '/payment',
  'razorpay',
  'checkout',
];

// ─── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // Skip waiting immediately so new SW takes over
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  // Delete ALL old caches on upgrade
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip sensitive/auth/payment endpoints
  if (NEVER_CACHE.some((path) => url.pathname.includes(path) || url.href.includes(path))) {
    return;
  }

  // Skip cross-origin requests (except same-origin audio)
  if (url.origin !== self.location.origin) return;

  // ── Audio files: Cache-first ──
  if (url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            return new Response('', { status: 503, statusText: 'Offline' });
          });
        });
      })
    );
    return;
  }

  // ── Navigation (HTML): Network-first ──
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Always update cache with fresh HTML
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached version
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // ── CSS/JS bundles: Network-first ──
  // Hashed filenames (e.g. index-Cg1fJFFd.css) must always come from network
  // to prevent stale styling after deployment
  if (url.pathname.startsWith('/assets/') && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached version
          return caches.match(request);
        })
    );
    return;
  }

  // ── Images/icons: Cache-first (stable assets) ──
  if (url.pathname.match(/\.(png|webp|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
        });
      })
    );
    return;
  }

  // ── Everything else: Network-first ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ─── MESSAGE: Skip waiting ────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
