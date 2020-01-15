const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');

const Email = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (req, res, statusCode) => {
  const { user, messageReturn: message } = req;
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    },
    message
  });
};

// ------------------------------SIGN UP----------------------
// TODO email não está vindo correto, tem que alterar para localhost
exports.signUp = catchAsync(async (req, res, next) => {
  let newUser = await User.findOne({ email: req.body.email });

  if (newUser) return next(new AppError('Email já está cadastrado', 400));

  if (!newUser) {
    newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: '123456789',
      confirmPassword: '123456789',
      isWithTempPassword: true,
      isNewAccount: true
    });
  }
  req.user = newUser;

  // Email com senha provisória
  const messageReturn =
    'Email de autenticação foi enviado. Verifique sua caixa de email e utilize a senha provisória para realizar seu primerio login.';

  await new Email(newUser).sendEmailNewAccount();

  res.status(200).json({
    status: 'success',
    message: messageReturn
  });
});

// ---------------------SEND TOKEN TO USER-----------------------
exports.sendToken = catchAsync(async (req, res) => {
  createSendToken(req, res, 200);
});

// ----------------------------LOGIN------------------------------
//TODO melhorar routing entre verificacr se esta fazendo login com token

exports.login = catchAsync(async (req, res, next) => {
  // Verificar se foi passado um token
  if (req.user) return next();

  const { email, password } = req.body;

  // Verify if email and password has been passed
  if (!email || !password) {
    return next(new AppError('Por favor forneça email e senha', 400));
  }

  // Verify if user exist
  const user = await User.findOne({ email: email }).select('+password');
  req.user = user;

  if (!user) {
    return next(new AppError('Email ou senha incorreto', 401));
  }

  // Verifica se está com senha provisória

  if (user.isWithTempPassword) {
    // Verify if password is correct
    if (!(await user.correctPassword(password, user.password)))
      return next(new AppError('Email ou senha incorreta', 401));

    // Verifica se senha provisoria expirou
    if (user.tempPasswordExpire < Date.now())
      return next(
        new AppError(
          'Sua senha provisória expirou. Por favor solicite outra senha provisória',
          401
        )
      );

    if (user.isNewAccount) req.messageReturn = 'Primeiro acesso';
    if (!user.isNewAccount) req.messageReturn = 'Recuperando senha';

    return next();
  }

  // Limit number of login attempts for the same email
  const dateNowNoMinSecMili = new Date().setMinutes(0, 0, 0);

  // Se estiver na primeira tentativa, então armazena o tempo que iniciou a primeira tentativa
  if (user.loginAttempts === 0) {
    user.dateLoginAttempt = dateNowNoMinSecMili;
  }

  // Reseta o número de tentativas depois de 1h
  if (dateNowNoMinSecMili > user.dateLoginAttempt) {
    user.dateLoginAttempt = undefined;
    user.loginAttempts = 0;
  } else if (
    !dateNowNoMinSecMili ||
    dateNowNoMinSecMili === user.dateLoginAttempt.getTime()
  ) {
    // Incrementa o número de tentativas
    user.loginAttempts += 1;
  }

  // Verifica se atingiu o número máximo de tentativas
  if (user.loginAttempts > process.env.NUMBER_LOGIN_ATTEMPTS) {
    return next(
      new AppError('Muitas tentativas de login. Tente novamente em 1 hora', 401)
    );
  }

  await user.save({ validateBeforeSave: false });

  // Verify if password is correct
  if (!(await user.correctPassword(password, user.password)))
    return next(new AppError('Email ou senha incorreta', 401));

  // Send token
  user.loginAttempts = 0;
  await user.save({ validateBeforeSave: false });

  next();
});

// ------------------------------PROTECT----------------------
exports.protect = catchAsync(async (req, res, next) => {
  // Verificar se foi enviado um token
  const { token } = req.body;

  if (!token) return next();

  // Verificar se token é valido
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Verificar se existe usuário para o token enviado
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    next(new AppError('Usuário não existe. Por favor, faça login.', 401));

  // Verificar se senha foi alterada

  // Garantir acesso
  req.user = currentUser;
  next();
});

// ------------------------------Forgot Password----------------------
//TODO colocar senha, verificar se é igual provisório e não dizer se expirou
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Verifcar se email existe
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new AppError(
        'Não existe usuário com esse email. Por favor tente novamente.',
        404
      )
    );

  req.user = user;

  //TODO implementar usuário ativo ou não se deletar usuário, o mesmo não é pra deletar no BD e sim transformar em inativo

  const messageReturn = 'Email com senha provisória enviada.';

  await new Email(user).sendEmailForgotPassword();

  res.status(200).json({
    status: 'success',
    message: messageReturn
  });
});

// -------------------------------REDEFINE PASSWORD-------------------------
exports.redefinePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.user._id).select('+password');
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.isWithTempPassword = false;
  user.tempPasswordExpire = undefined;
  user.isNewAccount = undefined;
  await user.save();
  req.messageReturn = 'Senha alterada com sucesso!';
  req.user = user;
  next();
});
