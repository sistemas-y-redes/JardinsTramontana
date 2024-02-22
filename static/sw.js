self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.notification.title || 'Nuevo periodo de vacaciones asignado';
  const options = {
    body: data.body || 'Tienes un nuevo periodo de vacaciones asignado. ¡Revisa los detalles!',
    icon: data.icon || '/icon.png',
    badge: '/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
