const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay Payment Link for a preorder
 * @param {Object} params
 * @returns {Object} payment link response
 */
exports.createPaymentLink = async ({ preOrderId, amount, customerName, customerEmail, customerPhone, productName }) => {
  const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

  const paymentLink = await razorpay.paymentLink.create({
    amount: amount * 100, // Razorpay expects paise
    currency: 'INR',
    accept_partial: false,
    description: `Pre-order: ${productName}`,
    customer: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    notes: {
      preorder_id: preOrderId.toString(),
      product: productName,
    },
    callback_url: `${process.env.FRONTEND_URL}/order-confirmation?preorder_id=${preOrderId}`,
    callback_method: 'get',
    expire_by: expiryTimestamp,
  });

  return {
    id: paymentLink.id,
    short_url: paymentLink.short_url,
    expiry: new Date(expiryTimestamp * 1000),
  };
};

/**
 * Verify Razorpay webhook signature
 */
exports.verifyWebhookSignature = (rawBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
};

/**
 * Verify payment link payment signature
 */
exports.verifyPaymentSignature = ({ paymentLinkId, paymentLinkRefId, razorpayPaymentId, signature }) => {
  const payload = `${paymentLinkId}|${paymentLinkRefId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
};

/**
 * Create a Razorpay Order for standard checkout
 */
exports.createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt,
    notes,
  });
  return order;
};

/**
 * Verify payment signature for standard checkout
 */
exports.verifyOrderPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
};

exports.razorpay = razorpay;
