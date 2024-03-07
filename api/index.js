/**
 * @file api/index.js
 * @description Punto de entrada de la API que se conecta a filemaker
 * @author Sistemas y Redes <departamentoweb@syr.es>
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const webPush = require('web-push');

// Importamos controladores para gestionar las rutas de la API
const usuarios = require("./controllers/users.controller");
const visitas = require("./controllers/visitas.controller");
const images = require("./controllers/images.controller");
const fichaje = require("./controllers/fichaje.controller");
const vacaciones = require("./controllers/vacaciones.controller");
const proyectos = require("./controllers/projects.controller");
const notificationsRouter = require('./controllers/notificationsController');

const vapidPublicKey = 'BIcIvSyTcUeuI__tZPs1MuQWG31692dv5QheWupn2SY9X6GB6kBR89oJEe1RK1lmu5FstGLCcdpnF0IhdS_O4p4';
const vapidPrivateKey = 'dkRhFVAQ7MIek72gVy5YRvdZygw_ruF1MCX2oLyyxKY';

webPush.setVapidDetails(
  'mailto:departamentoweb@syr.es', // Un correo de contacto
  vapidPublicKey,
  vapidPrivateKey
  );
  
  // Arrancamos la aplicación de Expresss
  const app = express();

// Inicializamos BodyParser para poder retornar los resultados en JSON
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cors());

// Definimos las rutas base para los controladores de la API
app.use('/api/usuarios', usuarios);
app.use('/api/visitas', visitas);
app.use('/api/images', images);
app.use('/api/fichaje', fichaje);
app.use('/api/vacaciones', vacaciones);
app.use('/api/proyectos', proyectos);
app.use('/api', notificationsRouter);

module.exports = app;