var nodemailer = require('nodemailer');


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
        to: 'cabad@comandato.com;diego.aviles@comandato.com;manuel.ramirez@comandato.com;julian.munoz@comandato.com,dayana.bailon@gaiaconsultores.biz;bryan.garcia@gaiaconsultores.biz;luismiguel.patino@gaiaconsultores.biz;jessica.obrien@gaiaconsultores.biz;',
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


module.exports = mailController;