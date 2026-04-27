const rateLimit = require('express-rate-limit');

// General API limiter
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Auth endpoints — stricter
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT',
  },
});

// Preorder — prevent spam
exports.preorderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many preorder attempts. Please try again in an hour.',
    code: 'PREORDER_RATE_LIMIT',
  },
});
