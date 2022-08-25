const ReviewModel = require('../models/Review');
const ProductModel = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const { checkPermissions } = require('../Utils');

const createReview = async (req, res) => {
  /* we check that the product for which the user wants to write review exists or not */
  const { product: productId } = req.body;

  const isValidProduct = await ProductModel.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  /* Alternate way of verifying for duplicate review, similarly tried in ReviewModel */
  const alreadySubmitted = await ReviewModel.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this product'
    );
  }

  // we attach the userId of account who writes review
  req.body.user = req.user.userId;

  const review = await ReviewModel.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  /* 
    Populate method is used to get info about referenced documents, here in our case it's user and product 
  */
  const reviews = await ReviewModel.find({})
    .populate({
      path: 'product',
      select: 'name comapny price',
    })
    .populate({ path: 'user', select: 'name' });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await ReviewModel.findOne({ _id: reviewId })
    .populate({
      path: 'product',
      select: 'name comapny price',
    })
    .populate({ path: 'user', select: 'name' });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: 'Success! Review deleted' });
};

// method as opposed to virtuals in product controller
const getSingleProductReviews = async (req, res) => {
  // we can do whatever quering we want here
  const { id: productId } = req.params;

  const reviews = await ReviewModel.find({ product: productId });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
