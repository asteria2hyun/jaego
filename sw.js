// jaego 서비스워커 — 네트워크 우선(항상 최신), 오프라인일 때만 캐시 폴백.
// 같은 출처(GET)만 다룸 → 구글 Apps Script(데이터) 호출은 절대 캐시/간섭 안 함.
const CACHE = 'jaego-v1';

self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 외부(중앙 백엔드 등)는 손대지 않음
  e.respondWith(
    fetch(req).then(function (res) {
      try { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } catch (x) {}
      return res;
    }).catch(function () { return caches.match(req); })   // 네트워크 안 되면 캐시
  );
});
