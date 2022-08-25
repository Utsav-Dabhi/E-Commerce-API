const mongoose = require('mongoose');
const validatorPkg = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 4,
    maxlength: 30,
  },
  email: {
    type: String,
    unique: true,
    require: [true, 'Please provide an email'],
    // we used regEX for validation in Jobs-API project

    // here we will use mongoose custom validation option
    validate: {
      // we can even write our custom fuction here but we will be using an npm package by the name of validator.js
      validator: validatorPkg.isEmail,
      message: 'Please provide an valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 5,
    // we dont add maxlength as we encrypt the password which can be pretty long
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

/* 
  The mongoose save hook helps run the code whenever an save method runs on any documents as well 
*/
// password hashing
UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified('name'));

  if (!this.isModified('password')) return;

  // generate the no of rounds for encryption
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// This method is used for confirming the password provided by user during login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  // it compares the password provided by user with the one in DB
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// we use singular form for the model in ' '
module.exports = mongoose.model('user', UserSchema);
