const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { sendOrderConfirmationEmail, sendOrderCancellationEmail } = require('../services/emailService');
const { createRazorpayOrder } = require('../services/razorpayService');

// 23 hours 59 minutes in milliseconds
const CANCEL_WINDOW_MS = (23 * 60 + 59) * 60 * 1000;

// POST /api/orders/:id/cancel — user cancels their own order within 23h 59m
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' });
    }

    // Only the owner can cancel (guests matched by email)
    const isOwner = order.userId?.toString() === req.user?._id?.toString();
    const isEmailMatch = order.customerEmail === req.user?.email;
    if (!isOwner && !isEmailMatch) {
      return res.status(403).json({ success: false, message: 'Not authorised', code: 'FORBIDDEN' });
    }

    // Cannot cancel if already shipped or delivered
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: order.status === 'cancelled' ? 'Order is already cancelled' : 'Order cannot be cancelled after it has been shipped',
        code: 'INVALID_STATUS',
      });
    }

    // Enforce 23h 59m cancellation window
    const msSincePlaced = Date.now() - new Date(order.createdAt).getTime();
    if (msSincePlaced > CANCEL_WINDOW_MS) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window of 23 hours 59 minutes has passed',
        code: 'CANCEL_WINDOW_EXPIRED',
      });
    }

    order.status = 'cancelled';
    await order.save();

    const shortId = order._id.toString().slice(-8).toUpperCase();

    // Send cancellation email (non-blocking)
    sendOrderCancellationEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      items: order.items,
      totalAmount: order.totalAmount,
      orderId: shortId,
    }).catch(err => console.error('[email] cancellation failed:', err));

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders — place a new order directly
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, totalAmount } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields', code: 'VALIDATION_ERROR' });
    }

    const orderItems = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const order = await Order.create({
      userId: req.user?._id || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: orderItems,
      totalAmount,
      status: 'pending',
      paymentMethod: 'pending',
    });

    const shortId = order._id.toString().slice(-8).toUpperCase();

    // Create Razorpay order for payment
    let razorpayOrderId = null;
    try {
      const rzpOrder = await createRazorpayOrder({
        amount: totalAmount,
        receipt: shortId,
        notes: { orderId: order._id.toString(), customerName, customerEmail },
      });
      razorpayOrderId = rzpOrder.id;
      order.razorpayOrderId = razorpayOrderId;
      await order.save();
    } catch (err) {
      console.error('[razorpay] order creation failed:', err.message);
    }

    res.status(201).json({
      success: true,
      order,
      orderId: order._id.toString(),
      shortId,
      razorpayOrderId,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — admin: all orders; user: own orders
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('preOrderId', 'paymentLinkUrl'),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' });
    }

    // Non-admins can only see their own orders
    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status — admin only
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', code: 'VALIDATION_ERROR' });
    }

    const updateData = { status };
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
    }
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
