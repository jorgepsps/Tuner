/* Service worker: casca offline. Troque VERSAO a cada publicação. */
const VERSAO = "harmonico-v4";
const CASCA = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          // guarda o que for do próprio app, para funcionar offline depois
          if (res && res.ok && new URL(e.request.url).origin === location.origin) {
            const copia = res.clone();
            caches.open(VERSAO).then((c) => c.put(e.request, copia));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
