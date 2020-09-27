var nodemailer = require('nodemailer');
const JSONTransport = require('nodemailer/lib/json-transport');


var mailController = {}

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
    console.log(subject, content)
    var mailOptions = {
        from: 'chatbot1@comandato.com',
     //   to: 'cabad@comandato.com;diego.aviles@comandato.com;manuel.ramirez@comandato.com;julian.munoz@comandato.com,dayana.bailon@gaiaconsultores.biz;bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;',
        to: 'dayana.bailon@gaiaconsultores.biz',
        subject: subject,
        html: content
      };

    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}


mailController.MailErrorWSFacturacion = (jsonEnviado) => {
    var mailOptions = {
      from: 'chatbot1@comandato.com',
  //   to: 'cabad@comandato.com;diego.aviles@comandato.com;manuel.ramirez@comandato.com;julian.munoz@comandato.com,dayana.bailon@gaiaconsultores.biz;bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;',
      to: 'dayana.bailon@gaiaconsultores.biz',
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
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}



    
mailController.MailErrorWSTickets = (datos) => {
  var mailOptions = {
    from: 'chatbot1@comandato.com',
//   to: 'cabad@comandato.com;diego.aviles@comandato.com;manuel.ramirez@comandato.com;julian.munoz@comandato.com,dayana.bailon@gaiaconsultores.biz;bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;',
    to: 'dayana.bailon@gaiaconsultores.biz',
    subject: 'Error de comunicación con WS de Tickets o Notificaciones',
    html: `<!DOCTYPE html>
    <html>
    <body>
        <p>Estimados</p>
        <p>La presente es para indicarles que el web services de tickets o notificaciones ha fallado después de 3 intentos</p>
        <p>A continuación se muestran los parametros enviados:</p>
        <code>
            ${JSON.stringify(datos)}
        </code>
        <p>Saludos</p>
    </body>
    </html>`
  };
  transporter.sendMail(mailOptions, function(error, info){    
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = mailController;