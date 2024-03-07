<template>
  <b-modal v-model="show" hide-footer title="Notificaciones">
    <div class="d-block text-center">
      <p>¿Deseas recibir notificaciones sobre las últimas actualizaciones?</p>
      <b-button variant="primary" @click="subscribeToNotifications">Aceptar</b-button>
      <b-button variant="danger" @click="hideModal">Cancelar</b-button>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    hideModal() {
      this.$emit('close');
    },
    subscribeToNotifications() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') return;

          navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
            }).then(subscription => {
              const userInfo = localStorage.getItem('UserInfo');
              const username = userInfo ? JSON.parse(userInfo).username : null;

              console.log(`Username before subscription: ${username}`);

              if (username) {
                this.sendSubscriptionToServer(subscription, username);
              } else {
                console.error('Username not found in local storage.');
              }

              this.$emit('close'); // Cierra el modal después de completar la suscripción
            }).catch(err => console.error('No se pudo suscribir al usuario: ', err));
          });
        });
      }
    },
    sendSubscriptionToServer(subscription, username) {
      fetch('/api/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          username: username
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Subscription sent to server:', data);
        })
        .catch(err => console.error('Error al enviar la suscripción al servidor:', err));
    },
    urlBase64ToUint8Array(base64String) {
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
  }
};
</script>

<style>
/* Estilos para tu modal */
</style>
