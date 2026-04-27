const express = require('express');
const router = express.Router();
const { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middlewares/auth');

// Public route — coupon validation at checkout
router.post('/validate', validateCoupon);

// Admin-only routes
router.use(protect, adminOnly);
router.get('/', getCoupons);
router.post('/', createCoupon);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
