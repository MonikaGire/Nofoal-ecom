const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus, createOrder, cancelOrder } = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');

router.post('/', optionalAuth, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
