const jwt = require('jsonwebtoken');

// payload is taken as object so we dont need to worry about order of arguments
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const verifyJwtToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('token', token, {
    /* if true this flag prevents accessing cookies from client-side scripts */
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    /* this flag is used for allowing accessing only through https */
    secure: process.env.NODE_ENV === 'production', // use https only for deployed one else use http for production
    signed: true,
  });

  // we can send the reponse from here as well but it is recommended to do so in controllers itself
  // res.status(201).json({ user });
};

module.exports = { createJWT, verifyJwtToken, attachCookiesToResponse };
