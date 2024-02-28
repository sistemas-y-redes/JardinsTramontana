// api/controllers/notificationsController.js

const db = require('../db'); // Asegúrate de que este archivo esté configurado correctamente con SQLite
const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');
const webPush = require('../webPush'); // Asegúrate de que este archivo esté configurado con tus VAPID keys

router.use(bodyParser.json());

// Método para guardar una suscripción
router.post('/save-subscription', (req, res) => {
    const { subscription, username } = req.body;
    const { endpoint, keys } = subscription;
    console.log('endpoint', endpoint);
    console.log('username', username);
    if (!keys || !keys.auth || !keys.p256dh) {
        return res.status(400).json({ success: false, message: 'Las claves de la suscripción son inválidas o están incompletas.' });
    }
    const sql = 'INSERT INTO subscriptions (endpoint, keys_auth, keys_p256dh, username) VALUES (?, ?, ?, ?)';

    db.run(sql, [endpoint, keys.auth, keys.p256dh, username], function (err) {
        if (err) {
            console.error('Error al guardar la suscripción', err);
            res.status(500).json({ success: false, message: 'Error al guardar la suscripción en la base de datos.' });
        } else {
            res.status(200).json({ success: true, message: 'Suscripción guardada correctamente.', id: this.lastID });
        }
    });
});

// Método para enviar notificaciones push
router.post('/send-notification', (req, res) => {
    const { username } = req.body;
    console.log('username', username);
    const sql = 'SELECT * FROM subscriptions WHERE username = ?';
    const notificationPayload = {
        notification: {
            title: req.body.notification.title || 'Nuevo periodo de vacaciones asignado',
            body: req.body.notification.body || 'Tienes un nuevo periodo de vacaciones asignado. ¡Revisa los detalles!',
            icon: req.body.notification.icon || '/icon.png',
            vibrate: [100, 50, 100],
        }
    };

    db.all(sql, [`"${username}"`], (err, subscriptions) => {
        console.log('Suscripciones recuperadas', subscriptions);
        if (err) {
            console.error('Error al recuperar suscripciones', err);
            res.status(500).json({ success: false, message: 'Error al recuperar suscripciones.' });
            return;
        }

        let promiseChain = Promise.resolve();
        subscriptions.forEach(subscription => {
            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    auth: subscription.keys_auth,
                    p256dh: subscription.keys_p256dh,
                },
            };

            promiseChain = promiseChain.then(() => webPush.sendNotification(pushSubscription, JSON.stringify(notificationPayload))
                .then(() => console.log('Notificación enviada con éxito.'))
                .catch(err => console.error('Error al enviar notificación', err)));
        });

        promiseChain.then(() => res.status(200).json({ success: true, message: 'Notificaciones enviadas correctamente.' }));
    });
});

module.exports = router;
