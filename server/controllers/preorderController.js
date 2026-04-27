const PreOrder = require('../models/PreOrder');
const Product = require('../models/Product');
const { validatePreorder } = require('../utils/validators');
const { createPaymentLink } = require('../services/razorpayService');
const { sendPreorderEmail } = require('../services/emailService');

// POST /api/preorder
exports.createPreorder = async (req, res, next) => {
  try {
    const { error, value } = validatePreorder(req.body);
    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ success: false, message: messages, code: 'VALIDATION_ERROR' });
    }

    // Find product by name (since frontend sends product_name not productId)
    const product = await Product.findOne({
      title: value.product_name,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    // Check inventory
    if (product.inventory < value.quantity) {
      return res.status(409).json({
        success: false,
        message: 'Insufficient inventory',
        code: 'OUT_OF_STOCK',
      });
    }

    // Check duplicate pending preorder (same email + product)
    const existing = await PreOrder.findOne({
      email: value.customer_email,
      productId: product._id,
      status: { $in: ['pending', 'payment_sent'] },
    });

    if (existing) {
      // Re-send existing payment link if still valid
      if (existing.paymentLinkUrl && existing.paymentLinkExpiry > new Date()) {
        sendPreorderEmail({
          to: value.customer_email,
          customerName: existing.name,
          productName: product.title,
          quantity: existing.quantity,
          totalAmount: existing.totalAmount,
          paymentLink: existing.paymentLinkUrl,
        }).catch(err => console.error('Re-send email error:', err.message));

        return res.status(200).json({
          success: true,
          message: 'Payment link sent to your email',
          data: { paymentLinkUrl: existing.paymentLinkUrl },
        });
      }
    }

    // Create PreOrder document
    const preOrder = await PreOrder.create({
      name: value.customer_name,
      email: value.customer_email,
      phone: value.customer_phone,
      address: value.customer_address,
      productId: product._id,
      productName: product.title,
      productPrice: value.product_price,
      quantity: value.quantity,
      totalAmount: value.total_amount,
      status: 'pending',
    });

    // Generate Razorpay payment link
    let paymentLinkUrl = null;
    try {
      const paymentLink = await createPaymentLink({
        preOrderId: preOrder._id,
        amount: value.total_amount,
        customerName: value.customer_name,
        customerEmail: value.customer_email,
        customerPhone: value.customer_phone,
        productName: product.title,
      });

      preOrder.paymentLinkId = paymentLink.id;
      preOrder.paymentLinkUrl = paymentLink.short_url;
      preOrder.paymentLinkExpiry = paymentLink.expiry;
      preOrder.status = 'payment_sent';
      await preOrder.save();

      paymentLinkUrl = paymentLink.short_url;
    } catch (razorpayErr) {
      console.error('Razorpay error:', razorpayErr.message);
      // Don't fail the preorder if payment link generation fails
      // Admin can manually create link
    }

    // Send confirmation email (non-blocking)
    sendPreorderEmail({
      to: value.customer_email,
      customerName: value.customer_name,
      productName: product.title,
      quantity: value.quantity,
      totalAmount: value.total_amount,
      paymentLink: paymentLinkUrl || `${process.env.FRONTEND_URL}/contact`,
    }).catch(err => console.error('Preorder email error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Payment link sent to your email',
      data: {
        preOrderId: preOrder._id,
        paymentLinkUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/preorder — admin only
exports.getAllPreorders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [preorders, total] = await Promise.all([
      PreOrder.find(filter)
        .populate('productId', 'title price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PreOrder.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      preorders,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/preorder/:id/status — admin only
exports.updatePreorderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'payment_sent', 'paid', 'failed', 'expired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', code: 'VALIDATION_ERROR' });
    }

    const preorder = await PreOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!preorder) {
      return res.status(404).json({ success: false, message: 'Preorder not found', code: 'NOT_FOUND' });
    }

    res.json({ success: true, preorder });
  } catch (err) {
    next(err);
  }
};
