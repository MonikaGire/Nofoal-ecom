const mongoose = require('mongoose');

const preOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'payment_sent', 'paid', 'failed', 'expired'],
    default: 'pending',
  },
  // Razorpay payment link details
  paymentLinkId: String,
  paymentLinkUrl: String,
  paymentLinkExpiry: Date,
  // Payment confirmation
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  // Linked order (after payment)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

preOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate pending preorders for same email+product
preOrderSchema.index({ email: 1, productId: 1, status: 1 });

module.exports = mongoose.model('PreOrder', preOrderSchema);
