const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 30,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDiscount: {
    type: Number, // Cap for percentage discounts
    default: null,
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
  },
  usagePerCustomer: {
    type: Number,
    default: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

couponSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
