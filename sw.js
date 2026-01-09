// Step Back - Service Worker (Network-first, no caching)

// Install event - just activate immediately
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Activate event - claim clients and clear any old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - always go to network, no caching
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // If offline and it's a navigation request, show a simple message
                if (event.request.mode === 'navigate') {
                    return new Response(
                        '<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f7f9fa;color:#5a7d8c;"><div style="text-align:center;"><h2>You\'re offline</h2><p>Please connect to the internet to use Step Back.</p></div></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            })
    );
});
