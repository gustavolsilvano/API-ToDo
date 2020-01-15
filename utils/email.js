const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
  constructor(user) {
    this.user = user;
    this.to = user.email;
    this.from = process.env.EMAIL_MAIN;
    this.firstName = user.name.split(' ')[0];
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log('aqui 👌👌👌');
      // Sendgrid
      return nodemailer.createTransport({
        //   service: 'SendGrid',
        //   auth: {
        //     user: process.env.SENDGRID_USERNAME,
        //     pass: process.env.SENDGRID_PASSWORD
        //   }
        // });
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          // should be replaced with real sender's account
          user: 'tucdev@gmail.com',
          pass: 'GUD@270403'
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject, tempPassword) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      subject,
      user: this.user,
      tempPassword,
      test: 'teste',
      firstName: this.firstName
    });

    // 2) Define the email options
    const mailOptions = {
      // from: this.from,
      to: this.to,
      subject,
      html
    };
    console.log('mailOPtions', mailOptions);
    // 3) Actually send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendEmailNewAccount() {
    const tempPassword = await this.user.createTempPassword();
    const template = 'newAccount';
    const subject =
      'Bem vindo ao Ultimate ToDo App! Essa é sua senha provisória (você tem 10 minutos para fazer login com essa senha).';
    await this.send(template, subject, tempPassword);
  }

  async sendEmailForgotPassword() {
    const tempPassword = await this.user.createTempPassword();
    const template = 'forgotPassword';
    const subject = 'Ultimate ToDo App! Esqueceu sua senha?';
    await this.send(template, subject, tempPassword);
  }
};
