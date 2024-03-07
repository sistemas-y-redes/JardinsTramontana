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
  keys_p256dh TEXT,
  username TEXT
)`);

module.exports = db;
