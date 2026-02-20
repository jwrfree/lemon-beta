const CACHE_NAME = "lemon-pwa-v3";
const OFFLINE_URL = "/offline";

const CORE_ASSETS = [
  OFFLINE_URL,
  "/favicon.svg",
  "/manifest.webmanifest",
];

// 1. Install - Prefetch essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// 2. Activate - Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Helper: Protect sensitive data
const isSensitiveRequest = (url) => {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/supabase/") ||
    url.pathname.includes("_next/data") // Prevents caching of page props (potential financial data)
  );
};

const isStaticAsset = (url) => {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/api/pwa-icon") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  );
};

// 3. Fetch - Strategi khusus aplikasi finansial
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // KRITIKAL: Jangan pernah cache data API atau Auth
  if (isSensitiveRequest(url)) {
    return; // Biarkan browser menangani secara normal (Network Only)
  }

  // A. Navigation (Main Page Shell) - Network First
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached ?? caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // B. Static Assets - Cache First / Stale-While-Revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. Default - Network Only (Minimal caching for everything else)
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
