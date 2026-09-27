// Network-only on purpose: job listings must always be fresh (see the
// 48h/72h rules in README), so this worker never caches anything — it
// exists only to make the site installable as a PWA.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
