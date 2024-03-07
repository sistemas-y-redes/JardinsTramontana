// api/webPush.js

const webPush = require('web-push');

// Reemplaza con tus propias VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webPush.setVapidDetails(
  'mailto:departamentoweb@syr.es', // Tu correo electrónico
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = webPush;