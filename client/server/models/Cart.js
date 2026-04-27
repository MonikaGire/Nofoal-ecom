const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  price: Number,
  coverImage: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  // Either userId (logged in) or sessionId (guest)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    index: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// TTL: guest carts expire after 7 days
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { userId: { $exists: false } } });

module.exports = mongoose.model('Cart', cartSchema);
