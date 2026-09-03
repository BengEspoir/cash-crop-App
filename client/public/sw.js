const VERSION = "agriculnet-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PUBLIC_CACHE = `${VERSION}-public`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/images/agriculnet_favicon_512.png", "/images/agriculnet_logo.svg"];
const PRIVATE_PATH = /\/(auth|admin|buyer|farmer|agent|api)\b|verify-|reset-password|oauth/;
const PRIVATE_API = /\/(payments|orders|verification|admin|auth|backups|restores|disputes|messages|conversations)\b/;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

function isCacheableResponse(response) {
  return response && response.ok && response.type !== "opaque" && !response.headers.get("set-cookie");
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(PUBLIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (isCacheableResponse(response)) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || network || Response.error();
}

async function networkFirst(request) {
  const cache = await caches.open(PUBLIC_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (request.mode === "navigate" ? caches.match(OFFLINE_URL) : Response.error());
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE_PATH.test(url.pathname) || PRIVATE_API.test(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|css|js)$/.test(url.pathname)) {
    event.respondWith(caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (isCacheableResponse(response)) cache.put(request, response.clone());
      return response;
    }));
    return;
  }
  if (/\.(?:png|jpe?g|webp|svg|gif)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (request.mode === "navigate") event.respondWith(networkFirst(request));
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || "AgriculNet update", {
    body: payload.body || "Open AgriculNet to view your update.",
    icon: "/images/agriculnet_favicon_512.png",
    badge: "/images/agriculnet_favicon_512.png",
    data: { url: payload.url || "/notifications" },
    tag: payload.tag || "agriculnet-update",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/notifications", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url === target);
    return existing ? existing.focus() : clients.openWindow(target);
  }));
});
