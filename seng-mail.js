const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000; 

// Middleware para que Express pueda leer el JSON enviado desde APEX
app.use(express.json());

// --- Configuración del Transportador SMTP ---
// IMPORTANTE: Aquí se usan tus credenciales SMTP de Gmail.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'tstgmlprb@gmail.com', 
    pass: 'ixjk pgzr aycp ocxz' // Contraseña de aplicación de Google
  },
});

// --- Endpoint POST: /send-email ---
// Este es el punto de entrada que APEX va a llamar.
app.post('/send-email', async (req, res) => {
  // 1. Extraer los datos del cuerpo JSON que APEX debe enviar
  const { to, subject, htmlBody, apiKey } = req.body;

  // 2. [OPCIONAL/RECOMENDADO] Autenticación básica con una clave secreta
  const SECRET_API_KEY = 'TU_CLAVE_SECRETA_APEX_2025'; 
  if (apiKey !== SECRET_API_KEY) {
      return res.status(401).send({ message: 'Acceso no autorizado. Clave API incorrecta.' });
  }

  if (!to || !subject || !htmlBody) {
    return res.status(400).send({ message: 'Faltan parámetros: "to", "subject" o "htmlBody".' });
  }
  
  const mailOptions = {
    from: '"Hoteles" <tstgmlprb@gmail.com>', // Remitente fijo o configurable
    to: to, // Destinatario (viene de APEX)
    subject: subject, // Asunto (viene de APEX)
    html: htmlBody // Cuerpo HTML (viene de APEX)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}. ID: ${info.messageId}`);
    
    // 3. Devolver una respuesta exitosa a APEX
    res.status(200).send({ 
        success: true,
        message: 'Correo enviado con éxito', 
        messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    // 4. Devolver un error al cliente (APEX)
    res.status(500).send({ 
        success: false,
        message: 'Fallo el envío del correo desde el middleware', 
        error: error.message 
    });
  }
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`Servicio de correo escuchando en el puerto ${port}`);
});