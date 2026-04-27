const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password_hash: {
    type: String,
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  waitlisted: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Remove sensitive fields from output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
