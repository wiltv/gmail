const express = require('express');
const app = express();
const port = process.env.PORT || 3000; 

// --- 1. Usar la librería de SendGrid ---
const sgMail = require('@sendgrid/mail'); 
// 2. Usar la API Key de la variable de entorno de Render
sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

app.use(express.json());

// --- ENDPOINT POST: /send-email ---
app.post('/send-email', async (req, res) => {
  const { to, subject, htmlBody, apiKey } = req.body;
  // ... (código de autenticación con apiKey aquí) ...
  
  const msg = {
    to: to,
    // CRÍTICO: Debe ser una dirección de remitente verificada en SendGrid
    from: 'verawil2404@gmail.com', 
    subject: subject,
    html: htmlBody,
  };

  try {
    // 3. Enviar vía API REST (evitando el bloqueo SMTP)
    await sgMail.send(msg); 
    
    res.status(200).send({ 
        success: true,
        message: 'Correo enviado con éxito vía SendGrid'
    });
    
  } catch (error) {
    console.error('Error al enviar el correo con SendGrid:', error);
    res.status(500).send({ 
        success: false,
        message: 'Fallo el envío', 
        error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Servicio de correo escuchando en el puerto ${port}`);

});

