const transporter = require('../nodemailerConfig');

async function enviarCorreo(datosCorreo) {
  try {
    // Envía el correo electrónico utilizando el transporte configurado
    await transporter.sendMail(datosCorreo);
    console.log('Correo electrónico enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw error;
  }
}

module.exports = { enviarCorreo };
