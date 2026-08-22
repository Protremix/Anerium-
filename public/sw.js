// OnePass PWA service worker — installable shell + offline-capable runtime cache.
// Strategy:
//   • Precache the app shell (index.html, manifest, icon) on install.
//   • Navigations (HTML): network-first → cache fallback (fresh when online, shell when offline).
//   • Same-origin static assets (JS/CSS/fonts/images): stale-while-revalidate (instant cache, background update; safe because Vite emits content-hashed URLs).
//   • Runtime cache is capped to ~80 entries to avoid unbounded growth.

const SHELL_CACHE = 'onepass-shell-v13';
const RUNTIME_CACHE = 'onepass-runtime-v13';
const RUNTIME_LIMIT = 80;

const SHELL = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => {
        if (self.registration.navigationPreload) {
          self.registration.navigationPreload.enable().catch(() => {});
        }
        return self.clients.claim();
      })
  );
});

// Enable navigation preload where supported so the network fetch overlaps SW startup.
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

async function trimCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  if (keys.length > RUNTIME_LIMIT) {
    // Evict oldest entries first (insertion order).
    for (const req of keys.slice(0, keys.length - RUNTIME_LIMIT)) {
      await cache.delete(req);
    }
  }
}

function isStaticAsset(url) {
  return /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|webp|svg|ico|wasm)$/.test(url.pathname);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin GETs; let API and cross-origin (fonts, maps, analytics) pass through.
  if (url.origin !== self.location.origin) return;

  // Navigations (HTML documents): network-first, fall back to cached shell.
  // Bypass service worker for /download — serve static page directly
  if (url.pathname === '/download' || url.pathname === '/download.html') {
    e.respondWith(fetch(req).catch(() => caches.match('/download.html')));
    return;
  }
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    e.respondWith((async () => {
      try {
        const preload = await e.preloadResponse;
        const res = preload || await fetch(req);
        const copy = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      } catch (_) {
        const cached = await caches.match(req) || await caches.match('/');
        return cached || Response.error();
      }
    })());
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            cache.put(req, copy).then(trimCache).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // Other same-origin GETs (e.g. API calls): stale-while-revalidate via runtime cache, but never block.
  e.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(req);
    const network = fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          cache.put(req, copy).then(trimCache).catch(() => {});
        }
        return res;
      })
      .catch(() => cached);
    return cached || network;
  })());
});

// === Web Push ===
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    try { data = { body: event.data ? event.data.text() : '' }; } catch (__) {}
  }
  const title = data.title || 'ANERIUM ONE PASS';
  const options = {
    body: data.body || data.message || '',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/icon.svg',
    tag: data.tag || '',
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        client.focus();
        client.postMessage({ type: 'push_click', url: targetUrl });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});
