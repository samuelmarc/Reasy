const CACHE_NAME = 'v4-cache-public';

const ASSETS = [
  '/',
  '/index.html',
  '/icon-512.png',
  '/manifest.json',
  '/js/app.js',
  '/js/bootstrap.bundle.min.js',
  '/js/docx/index.iife.js',
  '/js/jquery.min.js',
  '/css/bootstrap.min.css',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});