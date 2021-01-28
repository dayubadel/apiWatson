var nodemailer = require('nodemailer');
const JSONTransport = require('nodemailer/lib/json-transport');
const config = require('../config/config');
const logger = require('../models/winston');
const canalesMensajeriaController = require('./canalesMensajeriaController.js')

var mailController = {}

var respuestaGrupoWhatsapp = []

var transporter = nodemailer.createTransport({
  host: 'mail.comandato.com',
  port: '587',
  secure: false,
  auth: {
    user: 'chatbot1',
    pass: 'cmdchatbot#20'
  }
});


mailController.enviarEmail = async (subject, content) =>
{
    var mailOptions = {
        from: 'chatbot1@comandato.com',
        to: config.destinatarios.equipoGaia,
        cc: config.destinatarios.equipoGaia,
        subject: subject,
        html: content
      };
      console.log(config.destinatarios.equipoGaia)
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);  
          logger.error({tittle:'Error al intentar enviar un correo electronico',type:'Controller',file:'mailController.js',method:'enviarEmail',details: error})
          respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error a nivel interno de la Api, al intentar enviar un correo, revisar el log.`})
          canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}


mailController.enviarEmailCliente = async (destination, subject, content) =>
{
    console.log(subject, content)
    var mailOptions = {
        from: 'chatbot1@comandato.com',
        to: destination,
        subject: subject,
        html: content
      };

    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);   
          logger.error({tittle:'Error al intentar enviar un correo electronico',type:'Controller',file:'mailController.js',method:'enviarEmailCliente',details: error})
          respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error a nivel interno de la Api, al intentar enviar un correo, revisar el log.`})
          canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}


mailController.MailErrorWSFacturacion = (jsonEnviado) => {
    var mailOptions = {
      from: 'chatbot1@comandato.com',
      to: config.destinatarios.soporteTecnico,
      cc: config.destinatarios.equipoGaia,
      subject: 'Error de comunicación con WS de Facturacion Automática',
      html: `<!DOCTYPE html>
      <html>
      <body>
          <p>Estimados</p>
          <p>La presente es para indicarles que el web services de facturación automática ha fallado después de 3 intentos</p>
          <p>A continuación se muestran los parametros enviados:</p>
          <code>
              ${JSON.stringify(jsonEnviado)}
          </code>
          <p>Saludos</p>
      </body>
      </html>`
    };

  transporter.sendMail(mailOptions, function(error, info){
    
      if (error) {
        console.log(error);
        logger.error({tittle:'Error al intentar enviar un correo electronico',type:'Controller',file:'mailController.js',method:'MailErrorWSFacturacion',details: error})
        respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error a nivel interno de la Api, al intentar enviar un correo, revisar el log.`})
        canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}


mailController.MailErrorPaymentez = (jsonEnviado, transaction) => {
  var mailOptions = {
    from: 'chatbot1@comandato.com',
    to: config.destinatarios.ventas,
    cc: config.destinatarios.equipoGaia,
    subject: 'Error en pago de tarjeta con Paymentez',
    html: `<!DOCTYPE html>
    <html>
    <body>
        <p>Estimados</p>
        <p>La presente es para indicarles que un cliente ha intentado realizar un pago con tarjeta, pero se han presentado errores.</p>
        <p>Los errores son detallados a continuación:</p>
        <code>
          ${JSON.stringify(transaction)}
        </code>
        <p>Los parametros del cliente y de la compra son presentados a continuación:</p>
        <code>
          ${JSON.stringify(jsonEnviado)}
        </code>
        <p>Saludos</p>
    </body>
    </html>`
  };

transporter.sendMail(mailOptions, function(error, info){
  
    if (error) {
      console.log(error);
      logger.error({tittle:'Error al intentar enviar un correo electronico',type:'Controller',file:'mailController.js',method:'MailErrorPaymentez',details: error})
      respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error a nivel interno de la Api, al intentar enviar un correo, revisar el log.`})
      canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


    
mailController.MailErrorWSTickets = (datos) => {
  var mailOptions = {
    from: 'chatbot1@comandato.com',
    to: config.destinatarios.soporteTecnico,
    cc: config.destinatarios.equipoGaia,
    subject: 'Error de comunicación con WS de Tickets o Notificaciones',
    html: `<!DOCTYPE html>
    <html>
    <body>
        <p>Estimados</p>
        <p>La presente es para indicarles que el web services de tickets o notificaciones ha fallado después de 3 intentos</p>
        <p>A continuación se muestran los parametros enviados:</p>
        <code>
            ${datos}
        </code>
        <p>Saludos</p>
    </body>
    </html>`
  };
  transporter.sendMail(mailOptions, function(error, info){    
    if (error) {
      console.log(error);
      logger.error({tittle:'Error al intentar enviar un correo electronico',type:'Controller',file:'mailController.js',method:'MailErrorWSTickets',details: error})
      respuestaGrupoWhatsapp.push({type:'text',text:`*Proyecto:* ChatbotDora - Comandato\n*Api:* WatsonComandato\n*Mensaje:* Ha ocurrido un error a nivel interno de la Api, al intentar enviar un correo, revisar el log.`})
      canalesMensajeriaController.enviarMensajeWhatsapp(respuestaGrupoWhatsapp,config.destinatarios.grupoWhatsAppDesarrolladora)
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = mailController;