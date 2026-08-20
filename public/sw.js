/**
 * SunoBolo English — Service Worker
 *
 * Caching strategy:
 * - App shell (HTML, CSS, JS, icons): Cache-first after first load
 * - Audio files: Cache-first with network fallback (large MP3s)
 * - Navigation: Network-first with cache fallback (stale HTML avoidance)
 * - API / auth / payment: NEVER cached
 *
 * Security:
 * - Never caches private user data, auth tokens, or payment responses
 * - Never caches POST requests or sensitive endpoints
 */

const CACHE_NAME = 'sunobolo-v1';
const AUDIO_CACHE = 'sunobolo-audio-v1';

// App shell assets to pre-cache on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch(() => {
        // Silently ignore individual failures during pre-cache
        console.log('[SW] Some shell assets failed to pre-cache');
      });
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
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
            // Offline and not cached — return empty response
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
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // ── Static assets (JS, CSS, images): Cache-first ──
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ─── MESSAGE: Skip waiting ────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
