const UserModel = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../Utils');

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await UserModel.find({ role: 'user' }).select('-password');

  // we can use this or use select (to remove password)
  //   const newUsers = users.map((user) => {
  //     const { _id, name, email } = user;
  //     const temp = { _id, name, email };

  //     return temp;
  //   });

  res.status(StatusCodes.OK).json(users);
};

/* 
  One problem is that, if a user gets hold of another user's id he can use this route to see his details, so we use checkPermissions function 
*/
const getSingleUser = async (req, res) => {
  console.log(req.user);

  const user = await UserModel.findOne({ _id: req.params.id }).select(
    '-password'
  );

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json(user);
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

/*  see at the end for another flavour */
// if modifications are not done in UserModel then even while changing email and name will change the password as the password will be rehashed since we are using save()
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide email and name');
  }

  const user = await UserModel.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'Please provide both the old and new password'
    );
  }

  const user = await UserModel.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Password updated' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

/* update user using findOneAndUpdate */
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;

//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide email and name');
//   }

//   const user = await UserModel.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );

//   const tokenUser = createTokenUser(user);

//   attachCookiesToResponse({ res, user: tokenUser });

//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
