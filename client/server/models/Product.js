const mongoose = require('mongoose');

const keyElementSchema = new mongoose.Schema({
  tag: String,
  title: String,
  description: String,
  images: [String],
}, { _id: false });

const accSpecSchema = new mongoose.Schema({
  key: String,
  value: String,
  modalContent: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  coverImage: {
    type: String,
    required: true,
  },
  centerImage: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  // Accordion specifications
  specs: {
    type: [accSpecSchema],
    default: [],
  },
  // Key Elements feature cards
  keyElements: {
    type: [keyElementSchema],
    default: [],
  },
  inventory: {
    type: Number,
    default: 999,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    trim: true,
  },
  shippingDate: {
    type: String,
    default: 'March 31st, 2026',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
