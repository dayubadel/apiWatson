var nodemailer = require('nodemailer');

var mailController = {}

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'helenbailon95@gmail.com',
    pass: 'Bailon1995.'
  }
});


mailController.enviarEmail = async (subject, text) =>
{
    var mailOptions = {
        from: 'helenbailon95@gmail.com',
        to: 'dayana_bailon@outlook.com',
        subject: subject,
        text: text
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