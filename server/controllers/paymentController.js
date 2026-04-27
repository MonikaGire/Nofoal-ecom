const PreOrder = require('../models/PreOrder');
const Order = require('../models/Order');
const { verifyWebhookSignature, verifyOrderPaymentSignature } = require('../services/razorpayService');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../services/emailService');

// POST /api/payment/webhook
// Razorpay sends events here. Must use raw body (configured in index.js).
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing signature' });
    }

    // req.body is raw Buffer (configured in index.js for this route)
    const rawBody = req.body;

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Webhook: Invalid signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());
    console.log('Webhook event:', event.event);

    // Handle payment link paid event
    if (event.event === 'payment_link.paid') {
      await handlePaymentLinkPaid(event.payload);
    }

    // Acknowledge receipt
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Still return 200 to prevent Razorpay retries for processing errors
    res.status(200).json({ received: true });
  }
};

async function handlePaymentLinkPaid(payload) {
  const paymentLinkEntity = payload.payment_link && payload.payment_link.entity;
  const paymentEntity = payload.payment && payload.payment.entity;

  if (!paymentLinkEntity || !paymentEntity) return;

  const paymentLinkId = paymentLinkEntity.id;
  const razorpayPaymentId = paymentEntity.id;
  const notes = paymentLinkEntity.notes || {};
  const preOrderId = notes.preorder_id;

  if (!preOrderId) {
    console.warn('Webhook: No preorder_id in payment link notes');
    return;
  }

  const preOrder = await PreOrder.findById(preOrderId);
  if (!preOrder) {
    console.warn('Webhook: PreOrder not found for id', preOrderId);
    return;
  }

  // Prevent double-processing
  if (preOrder.status === 'paid') {
    console.log('Webhook: PreOrder already paid, skipping');
    return;
  }

  // Update preorder status
  preOrder.status = 'paid';
  preOrder.razorpayPaymentId = razorpayPaymentId;
  preOrder.paymentLinkId = paymentLinkId;
  await preOrder.save();

  // Create Order
  const order = await Order.create({
    preOrderId: preOrder._id,
    customerName: preOrder.name,
    customerEmail: preOrder.email,
    customerPhone: preOrder.phone,
    shippingAddress: preOrder.address,
    items: [{
      productId: preOrder.productId,
      productName: preOrder.productName,
      price: preOrder.productPrice,
      quantity: preOrder.quantity,
      subtotal: preOrder.totalAmount,
    }],
    totalAmount: preOrder.totalAmount,
    status: 'paid',
    paymentId: razorpayPaymentId,
    paymentMethod: paymentEntity.method || 'razorpay',
  });

  // Link order to preorder
  preOrder.orderId = order._id;
  await preOrder.save();

  const shortId = order._id.toString().slice(-8).toUpperCase();

  // Send user confirmation + admin notification (non-blocking)
  sendOrderConfirmationEmail({
    to: preOrder.email,
    customerName: preOrder.name,
    items: [{ productName: preOrder.productName, quantity: preOrder.quantity, price: preOrder.productPrice || preOrder.totalAmount }],
    totalAmount: preOrder.totalAmount,
    orderId: shortId,
    shippingAddress: preOrder.address,
  }).catch(err => console.error('[email] preorder confirmation failed:', err.message));

  sendAdminOrderNotification({
    orderId: shortId,
    customerName: preOrder.name,
    customerEmail: preOrder.email,
    customerPhone: preOrder.phone,
    items: [{ productName: preOrder.productName, quantity: preOrder.quantity, price: preOrder.productPrice || preOrder.totalAmount }],
    totalAmount: preOrder.totalAmount,
    shippingAddress: preOrder.address,
    paymentId: razorpayPaymentId,
  }).catch(err => console.error('[email] admin preorder notification failed:', err.message));

  console.log(`Order created: ${order._id} for preorder ${preOrderId}`);
}

// POST /api/payment/verify — verifies standard checkout payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const isValid = verifyOrderPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature: razorpaySignature });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({ success: true, orderId: order._id, shortId: order._id.toString().slice(-8).toUpperCase() });
    }

    order.status = 'paid';
    order.paymentId = razorpayPaymentId;
    order.paymentMethod = 'razorpay';
    await order.save();

    const shortId = order._id.toString().slice(-8).toUpperCase();

    // Send user confirmation + admin notification (non-blocking)
    sendOrderConfirmationEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      items: order.items,
      totalAmount: order.totalAmount,
      orderId: shortId,
      shippingAddress: order.shippingAddress,
    }).catch(err => console.error('[email] user confirmation failed:', err));

    sendAdminOrderNotification({
      orderId: shortId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: order.items,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentId: razorpayPaymentId,
    }).catch(err => console.error('[email] admin notification failed:', err));

    res.json({ success: true, orderId: order._id, shortId });
  } catch (err) {
    next(err);
  }
};
