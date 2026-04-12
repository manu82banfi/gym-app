
const CACHE = "gym-cache-dynamic-v1";

// ======================
// 🚀 INSTALL (immediato)
// ======================

self.addEventListener("install", event => {
  self.skipWaiting(); // attiva subito

  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "./",
        "index.html",
        "app.js",
        "style.css",
        "manifest.json"
      ]);
    })
  );
});

// ======================
// 🔥 ACTIVATE (forza update)
// ======================

self.addEventListener("activate", event => {
  event.waitUntil(
    self.clients.claim() // prende controllo subito
  );
});

// ======================
// 🌐 FETCH INTELLIGENTE (PRO MODE)
// ======================

self.addEventListener("fetch", event => {

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // aggiorna cache automaticamente
        const clone = res.clone();
        caches.open(CACHE).then(cache => {
          cache.put(event.request, clone);
        });

        return res;
      })
      .catch(() => {
        // fallback offline
        return caches.match(event.request);
      })
  );
});

// ======================
// 🔄 AUTO UPDATE CACHE
// ======================

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
