const express = require('express');
const multer = require('multer');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

const {
  signUp,
  login,
  protect,
  sendToken,
  forgotPassword,
  redefinePassword
} = require('../controller/authController');
const { getAllUsers } = require('../controller/userController');

const router = express.Router();

router.route('/signUp').post(signUp);

router.route('/login').post(protect, login, sendToken);

router.route('/forgotPassword').post(forgotPassword);

router.route('/redefinePassword').patch(protect, redefinePassword, sendToken);

router.route('/').get(getAllUsers);
const storage = multer.diskStorage({
  destination: './public/img/user',
  filename: function(req, file, cb) {
    cb(
      null,
      `${req.body.userId}-${Date.now()}.${file.originalname.split('.')[1]}`
    );
  }
});

const upload = multer({ storage });

router.route('/uploadImage').post(
  upload.single('fileData'),
  catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.body.userId, { photo: req.file.filename });
    res.status(200).json({
      status: 'success'
    });
  })
);

module.exports = router;
