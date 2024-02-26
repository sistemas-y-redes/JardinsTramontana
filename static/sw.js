self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.notification.title || 'Título por defecto';
  const options = {
      body: data.notification.body || 'Mensaje por defecto',
      icon: data.notification.icon || '/icon.png',
      badge: '/badge.png'
      // Asegúrate de incluir cualquier otro campo relevante aquí
  };

  event.waitUntil(self.registration.showNotification(title, options));
});