if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./ServiceWorker.js').then(response => console.log('Service Worker registrado correctamente: ', response))
    .catch(error => console.error('Fallo en el registro del Service Worker:', error));
}