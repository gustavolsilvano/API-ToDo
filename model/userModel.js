const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Preencha o campo nome'],
    maxlength: [30, 'Nome de usuário deve ter no máximo 30 caracteres'],
    minlength: [6, 'Nome de usuário deve ter no mínimo 6 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Preencha o campo email'],
    unique: true,
    validate: [validator.isEmail, 'Email com formato inadequado.']
  },
  password: {
    type: String,
    required: [true, 'Preencha o campo senha'],
    default: '',
    maxlength: [20, 'Senha deve ter no máximo 20 caracteres'],
    minlength: [8, 'Senha deve ter no mínimo 8 caracteres']
  },
  confirmPassword: {
    type: String,
    required: [true, 'Preencha o campo confirmar senha'],
    default: '',
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'As senhas devem ser identicas'
    }
  },
  photo: {
    type: String
  },
  dateLoginAttempt: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  isWithTempPassword: Boolean,
  tempPasswordExpire: Date,
  isNewAccount: Boolean,
  isActive: {
    type: Boolean,
    default: true
  }
});

userSchema.pre('save', async function(next) {
  // Verify if the only thing that has changed is the password
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm from the database
  this.confirmPassword = undefined;

  next();
});

// Compare password from user
userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// Cria senha provisória
userSchema.methods.createTempPassword = async function() {
  const tempPassword = crypto.randomBytes(4).toString('hex');

  this.password = tempPassword;
  this.isWithTempPassword = true;

  //Temp password expira em 10min
  this.tempPasswordExpire = Date.now() + 10 * 60 * 1000;

  await this.save({ validateBeforeSave: false });

  return tempPassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
