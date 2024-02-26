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

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    registration.pushManager.getSubscription().then(subscription => {
      if (!subscription) {
        // Solicitar permiso para notificaciones
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BIcIvSyTcUeuI__tZPs1MuQWG31692dv5QheWupn2SY9X6GB6kBR89oJEe1RK1lmu5FstGLCcdpnF0IhdS_O4p4') // Reemplaza con tu VAPID public key
        }).then(subscription => {
          // Recuperar el username del almacenamiento local
          const username = localStorage.getItem('User');
          // Enviar la suscripción y username al servidor
          fetch('/api/save-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
             subscription,
              username: username
            }),
          });
        }).catch(error => console.error('Error al suscribirse a las notificaciones push', error));
      }
    });
  });
}

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
