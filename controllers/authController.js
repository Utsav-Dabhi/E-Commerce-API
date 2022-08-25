const UserModel = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../Utils');

const register = async (req, res) => {
  /* 
      You can throw the error in middleware here as shown below OR
      Use mongoose error from our error-handler middleware
  */
  const { email, name, password } = req.body;
  const emailAlreadyExists = await UserModel.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already registered');
  }

  // First user registered is admin
  const isFirstAccount = (await UserModel.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await UserModel.create({ name, email, password, role });

  /* Once the user is successfully registered we can issue a json web token */
  // Now in the payload, you don't wanna send the entire user as it contains sensitive information. So we will create an Token User Object and pass it as payload
  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide name and password');
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = (req, res) => {
  /* You can set the cookie as any string or just empty string */
  // res.cookie('token', 'logout', {
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 5 * 1000), // expires in 5sec
  // });

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: 'Successfully logged out' });
};

module.exports = {
  register,
  login,
  logout,
};
