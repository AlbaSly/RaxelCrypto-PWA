const cacheName = 'RaxelCrypto_v4';

self.addEventListener('install', ev => {
    console.log('Service Worker instalado correctamente', ev);

    ev.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('Cacheando...', cache);

            cache.addAll([
                './',
                './manifest.json',
                './index.html',
                './css/app.css',
                './css/normalize.css',
                './css/skeleton.css',
                './js/sw-loader.js',
                './js/app.js',
            ]);
        }).catch(console.error)
    );
});

self.addEventListener('activate', ev => {
    console.log('Service Worker activado; ', ev);

    ev.waitUntil(
        caches.keys().then(keys => {
            console.log(keys);
            return Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key)));
        })
    )
});

self.addEventListener('fetch', ev => {
    console.log('Fetching...', ev);

    ev.respondWith(async()=> {
        const cachedResponse = await caches.match(ev.request);
        return cachedResponse;
    })
});