const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin, validateWaitlist } = require('../utils/validators');
const { sendWaitlistEmail, sendAdminWaitlistNotification, sendPasswordResetEmail } = require('../services/emailService');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { error, value } = validateSignup(req.body);
    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ success: false, message: messages, code: 'VALIDATION_ERROR' });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use', code: 'EMAIL_EXISTS' });
    }

    const user = await User.create({
      name: value.name,
      email: value.email,
      password_hash: value.password,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: 'Invalid credentials format', code: 'VALIDATION_ERROR' });
    }

    const user = await User.findOne({ email: value.email }).select('+password_hash');
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await user.comparePassword(value.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond success to avoid email enumeration
    if (!user || !user.password_hash) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate raw token, store sha256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({ to: email, resetUrl, name: user.name });

    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password_hash +resetPasswordToken +resetPasswordExpires');

    if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    user.password_hash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/waitlist
exports.joinWaitlist = async (req, res, next) => {
  try {
    const { error, value } = validateWaitlist(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: 'Valid email required', code: 'VALIDATION_ERROR' });
    }

    // Upsert waitlist user
    await User.findOneAndUpdate(
      { email: value.email },
      { email: value.email, waitlisted: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send confirmation + admin notification (non-blocking)
    sendWaitlistEmail({ to: value.email }).catch(err => {
      console.error('Waitlist email failed:', err.message);
    });
    sendAdminWaitlistNotification({ email: value.email }).catch(err => {
      console.error('Admin waitlist notification failed:', err.message);
    });

    res.status(200).json({ success: true, message: "You're on the waitlist!" });
  } catch (err) {
    next(err);
  }
};
