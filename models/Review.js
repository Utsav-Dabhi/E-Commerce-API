const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide an rating'],
    },
    title: {
      type: String,
      trim: true,
      require: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      require: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'product',
      required: true,
    },
  },
  { timestamps: true }
);

/* We want one review per user for each product */
// we cannot use unique: true for user and product individually, so we make complex index using mongoose
// we can do this in controller as well
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

/* 
  Static methods are different than instance methods
  eg - 
  1. UserSchema.methods,{methodName} is applied when we call the method on instance of schema
  2. ReviewSchema.statics.{methodName} is applied on the whole schema altogether
*/

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // console.log(productId);

  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: 'product',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);

  console.log(result);

  try {
    await this.model('product').findOneAndUpdate(
      { id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numberOfReviews: result[0]?.numberOfReviews || 0,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

// pre - before, post - after
ReviewSchema.post('save', async function () {
  // console.log('post save hook called');
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function () {
  // console.log('post remove hook called');
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('review', ReviewSchema);
