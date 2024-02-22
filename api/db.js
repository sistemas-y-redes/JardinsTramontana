// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./myPushSubscriptions.db');

// db.serialize(() => {
//   db.run("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT, p256dh TEXT, auth TEXT)");
// });

// const insertSubscription = (subscription) => {
//     const stmt = db.prepare("INSERT INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)");
//     stmt.run(subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth);
//     stmt.finalize();
//   };
  
//   const getSubscriptions = () => {
//     return new Promise((resolve, reject) => {
//       db.all("SELECT endpoint, p256dh, auth FROM subscriptions", [], (err, rows) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(rows);
//       });
//     });
//   };
// api/db.js

const sqlite3 = require('sqlite3').verbose();
const dbName = 'subscriptions.db';
let db = new sqlite3.Database(dbName, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Conexión exitosa a la base de datos SQLite.');
});

// Crear tabla de suscripciones si no existe
db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  keys_auth TEXT,
  keys_p256dh TEXT
)`);

module.exports = db;
