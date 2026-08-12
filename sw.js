/* 简易 Service Worker：缓存外壳，便于「添加到主屏幕」与弱网。
 * 代码/数据结构变更时递增 CACHE，确保旧缓存整体淘汰。
 */
const CACHE = "yujian-shell-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE.map(function (u) {
        return new Request(u, { cache: "reload" });
      })).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var cacheable = /\.(?:js|html|json|svg)$/i.test(url.pathname) || url.pathname.endsWith("/");
  if (!cacheable) return;

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
