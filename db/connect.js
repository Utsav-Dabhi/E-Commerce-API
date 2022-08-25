const mongoose = require('mongoose');

const connect = (url) => {
  // mongoose 6 does not require to mention deprication warning parameters
  return mongoose.connect(url);
};

module.exports = connect;
