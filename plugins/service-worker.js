if (process.client) {
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      }).catch(registrationError => {
        console.log('Error al registrar el Service Worker:', registrationError);
      });
    }
  });
}
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_USERNAME') {
    // Almacenar el username en el contexto del service worker
    const username = event.data.username;
    console.log(`Username set in service worker: ${username}`);
    // Puedes almacenar este username en IndexedDB o usarlo directamente según sea necesario
  }
});

function urlBase64ToUint8Array(base64String) {
  console.log('Base64 String:', base64String); // Depuración: Verificar el valor de base64String

  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
