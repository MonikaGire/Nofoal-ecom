const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token from Authorization header or cookie
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies (for Next.js SSR requests)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'UNAUTHORIZED',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'UNAUTHORIZED',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    });
  }
};

// Admin-only access
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'FORBIDDEN',
    });
  }
  next();
};

// Optional auth — attaches user if token exists but doesn't block
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {
    // Silently ignore
  }
  next();
};
