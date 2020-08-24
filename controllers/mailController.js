var nodemailer = require('nodemailer');

var mailController = {}

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'helenbailon95@gmail.com',
    pass: 'Bailon1995.'
  }
});


mailController.enviarEmail = async (subject, content) =>
{
    console.log(subject, content)
    var mailOptions = {
        from: 'helenbailon95@gmail.com',
        to: 'helenbailon95@gmail.com',
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