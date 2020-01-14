const express = require('express');
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

module.exports = router;
