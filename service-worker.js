const CACHE_NAME = "gym-app-cache-v1";

const FILES = [
  "./",
  "index.html",
  "app.js",
  "cloud.js",
  "style.css",
  "manifest.json",
  "icon.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting(); // forza attivazione immediata

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES);
    })
  );
});

// ATTIVAZIONE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // elimina vecchie cache
          }
        })
      );
    })
  );

  self.clients.claim(); // prende controllo subito
});

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // aggiorna cache con versione nuova
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return res;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});