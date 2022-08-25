// dotenv package to access env variables
require('dotenv').config();

// instead of applying try catch block for each controller we can use this package
require('express-async-errors');

// express
const express = require('express');
const app = express();

/* REST of the packages */
// HTTP request logger middleware
const morgan = require('morgan');
// Cookie accessor package
const cookieParser = require('cookie-parser');
// Uploading files on server
const uploadFile = require('express-fileupload');
// Security packages
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanatize = require('express-mongo-sanitize');

// database
const connectDB = require('./db/connect');

/* ROUTERS */
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

// error-handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const fileUpload = require('express-fileupload');

app.set('trust proxy', 1);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanatize());

app.use(morgan('tiny')); // HTTP logger
app.use(express.json()); // used to access json data form requests and responses from req.body
app.use(cookieParser(process.env.JWT_SECRET)); // to access the cookies in front-end
app.use(express.static('./public')); // to share public files
app.use(fileUpload());

/* ROUTES */
app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/api/v1', (req, res) => {
  // console.log(req.cookies);
  console.log(req.signedCookies);
  res.send('Cookies');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.use(notFoundMiddleware);
// this middleware is placed at last as it is invoked in route that exists when we throw an error in any of the existing routes
app.use(errorHandlerMiddleware);

// use port assigned by cloud hoster or else the one provided by us (5000)
const PORT = process.env.PORT || 5000;
const start = async () => {
  // it makes more sense to first connect to DB and then start the server
  try {
    await connectDB(process.env.MONGO_URL); // DB connection
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
