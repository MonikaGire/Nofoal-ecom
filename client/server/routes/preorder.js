const express = require('express');
const router = express.Router();
const { createPreorder, getAllPreorders, updatePreorderStatus } = require('../controllers/preorderController');
const { protect, adminOnly } = require('../middlewares/auth');
const { preorderLimiter } = require('../middlewares/rateLimiter');

// Public: submit preorder
router.post('/', preorderLimiter, createPreorder);

// Admin: view/manage preorders
router.get('/', protect, adminOnly, getAllPreorders);
router.patch('/:id/status', protect, adminOnly, updatePreorderStatus);

module.exports = router;
