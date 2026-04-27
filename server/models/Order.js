const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Optional — guests won't have userId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // From preorder
  preOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreOrder',
  },
  // Customer info (denormalized for order record durability)
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  shippingAddress: { type: String, required: true },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  // Coupon
  couponCode: String,
  discountAmount: { type: Number, default: 0 },

  // Razorpay
  razorpayOrderId: String,
  paymentId: String,
  paymentMethod: String,
  // Tracking
  trackingNumber: String,
  shippedAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
