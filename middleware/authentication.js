const CustomError = require('../errors');
const { verifyJwtToken } = require('../Utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = verifyJwtToken(token);
    req.user = { name, userId, role };
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  //   if (req.user.role !== 'admin') {
  //     throw new CustomError.UnauthorizeError('Unauthorized to access this route');
  //   }

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizeError(
        'Unauthorized to access this route'
      );
    }

    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
