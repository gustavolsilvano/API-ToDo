const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  console.log(err);
  let errorLog = err;

  // Timedout
  if (errorLog.message === 'Response timeout') {
    errorLog = new AppError(
      'Não foi possível contactar o servidor. Por favor, tente novamente mais tarde',
      500
    );
  }

  // Handling user validation
  if (errorLog._message === 'User validation failed') {
    const keyErro = Object.keys(errorLog.errors);
    errorLog = new AppError(errorLog.errors[keyErro[0]].message, 400);
  }

  // Return message with erro
  res.status(errorLog.statusCode).json({
    status: errorLog.status,
    message: errorLog.message
  });
};
