// api/controllers/notificationsController.js

const db = require('../db'); // Asegúrate de que este archivo esté configurado correctamente con SQLite
const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');
const webPush = require('../webPush'); // Asegúrate de que este archivo esté configurado con tus VAPID keys

router.use(bodyParser.json());

// Método para guardar una suscripción
router.post('/save-subscription', (req, res) => {
    const { endpoint, keys } = req.body;
    const sql = 'INSERT INTO subscriptions (endpoint, keys_auth, keys_p256dh) VALUES (?, ?, ?)';

    db.run(sql, [endpoint, keys.auth, keys.p256dh], function(err) {
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
    const notificationPayload = {
        notification: {
            title: 'Nuevo periodo de vacaciones asignado',
            body: 'Tienes un nuevo periodo de vacaciones asignado. ¡Revisa los detalles!',
            // icon: 'icons/icon-96x96.png',
            vibrate: [100, 50, 100],
        },
    };

    const sql = 'SELECT * FROM subscriptions';
    db.all(sql, [], (err, subscriptions) => {
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
                .catch(err => console.error('Error al enviar notificación', err)));
        });

        promiseChain.then(() => res.status(200).json({ success: true, message: 'Notificaciones enviadas correctamente.' }));
    });
});

module.exports = router;
