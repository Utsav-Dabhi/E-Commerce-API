const ProductModel = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createProduct = async (req, res) => {
  // we need to attach the userId of account who creates the product to the product itself (check ProductModel)
  req.body.user = req.user.userId;

  const product = await ProductModel.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  /* 
    Since we have only one admin we only look for productId only
    If there are multiple admins then we need to query the DB accordingly
  */

  const products = await ProductModel.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  /* 
    Usually we would like to get reviews as well with a single product.
    But the gotcha here is that we cannot use mongoose populate as we are not creating reference to reviews while creating products.
    Instead we will use mongoose virtuals in the product model
  */
  const { id: productId } = req.params;

  // whatever name is set in populate method should be used in virtual properties as well {See product model}
  // NOTE: we can't query - sort, pagination, etc as the reviews are virtuals. So the alternate flavour is mentioned in review contoller [at last]
  const product = await ProductModel.findOne({ _id: productId }).populate(
    'reviews'
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await ProductModel.findOneAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  /*
    We have intentionally used remove() instead of deleteOne() as when we delete the product we want to delete the reviews associated with the products as well.
    So using remove() will trigger the hook
  */
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: 'Success! Product deleted' });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded');
  }

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please apload an image only');
  }

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image less than 1MB');
  }

  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );

  await productImage.mv(imagePath);

  res.status(StatusCodes.OK).json({ img: `/upload/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
