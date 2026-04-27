const express = require('express');
const router = express.Router();
const { handleWebhook, verifyPayment } = require('../controllers/paymentController');

// Razorpay webhook — raw body is handled in index.js for this route
router.post('/webhook', handleWebhook);

// Verify standard checkout payment signature
router.post('/verify', verifyPayment);

module.exports = router;
