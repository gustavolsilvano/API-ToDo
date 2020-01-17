const multer = require('multer');
const fs = require('fs');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

const storage = multer.diskStorage({
  destination: './public/img/user',
  filename: function(req, file, cb) {
    const firstPart = `${req.body.userName.split('.')[0].replace(/ /g, '-')}`;
    cb(null, `${firstPart}-${Date.now()}.${file.mimetype.split('/')[1]}`);
  }
});

const upload = multer({ storage });

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = catchAsync(async (req, res, next) => {
  // Verifica se email que se quer está relacionado com usuário de outra conta
  const isEmailExist = await User.findOne({ email: req.body.userEmail });

  const currentUser = await User.findById(req.body.userId);

  if (
    isEmailExist &&
    currentUser._id.toString() !== isEmailExist._id.toString()
  )
    return next(
      new AppError(
        'Email já está sendo utilizado. Por favor escolha outro email.',
        401
      )
    );

  // Deletar imagem anterior
  if (req.file && currentUser.photo !== 'profilePlaceholder.jpg') {
    await fs.unlink(
      `${__dirname}/../public/img/user/${currentUser.photo}`,
      err => {
        console.log('erro ao remover', err);
      }
    );
  }

  const newUser = await User.findByIdAndUpdate(req.body.userId, {
    photo: req.file ? req.file.filename : currentUser.photo,
    name: req.body.userName,
    email: req.body.userEmail
  });
  res.status(200).json({
    status: 'success',
    message: 'Atualização realizada com sucesso!',
    data: {
      user: newUser
    }
  });
});
