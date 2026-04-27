const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { optionalAuth } = require('../middlewares/auth');

// All cart routes support both logged-in and guest users
router.use(optionalAuth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
