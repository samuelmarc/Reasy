// sw.js
const CACHE_NAME = 'v6-cache-public';
const ASSETS = [
  './',
  './index.html',
  './icon-512.png',
  './manifest.json',
  './js/app.js',
  './js/bootstrap.bundle.min.js',
  './js/docx/index.iife.js',
  './js/jquery.min.js',
  './css/bootstrap.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.error('Failed:', url, err)))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});