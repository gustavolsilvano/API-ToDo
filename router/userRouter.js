const express = require('express');

const {
  signUp,
  login,
  protect,
  sendToken,
  forgotPassword,
  redefinePassword
} = require('../controller/authController');
const {
  getAllUsers,
  uploadUserPhoto,
  updateMe
} = require('../controller/userController');

const router = express.Router();

router.route('/').get(getAllUsers);

router.route('/signUp').post(uploadUserPhoto, signUp);
router.route('/login').post(protect, login, sendToken);
router.route('/forgotPassword').post(forgotPassword);
router.route('/updateMe').post(uploadUserPhoto, updateMe);

router.route('/redefinePassword').patch(protect, redefinePassword, sendToken);

module.exports = router;
