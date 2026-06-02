const CACHE_NAME = 'ipv-audit-v2.0.0';
const STATIC_CACHE = 'ipv-static-v2.0.0';
const DYNAMIC_CACHE = 'ipv-dynamic-v2.0.0';

// Recursos a cachear estáticamente
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[SW] Eliminando cache antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Stale-While-Revalidate para archivos estáticos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Excluir archivos de analytics o APIs
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Para archivos estáticos (icons, imágenes)
  if (event.request.url.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
        })
    );
    return;
  }
  
  // Para HTML, manifest, etc. - Network First con fallback a cache
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return caches.match(event.request);
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', event => {
  console.log('[SW] Sync event:', event);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Sincronizando datos...');
  // Aquí puedes implementar sincronización con IndexedDB
}

// Notificaciones push (opcional)
self.addEventListener('push', event => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200]
    })
  );
});