const CACHE_NAME = 'v3-cache-public';

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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache configurado com sucesso');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});