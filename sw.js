const CACHE_NAME = "pricelist-network-first-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data/prices.json"
];

// 1. Install: Cache the basic app shell
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Clean up old versions
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Smart Fetch: Try Network First -> Then Cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If we got a valid response from internet, CLONE it and update cache
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (Offline), so use the cached version
        return caches.match(e.request);
      })
  );
});
