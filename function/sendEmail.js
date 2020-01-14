const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const sendTokenEmail = async req => {
  const { user } = req;

  const token = await user.createTempPassword();

  const message = req.message.replace('<TOKEN>', token);

  try {
    await sendEmail({
      email: user.email,
      subject: 'Ultimate ToDo App: Senha provisória',
      message
    });
    return token;
  } catch (err) {
    if (req.tokenType === 'email') await user.delete();
    // TODO depois de autenticado deve deletar emailcheck e emailexpire

    throw new AppError(
      'Não foi possível enviar email. Tente novamente mais tarde.',
      503
    );
  }
};

module.exports = sendTokenEmail;
