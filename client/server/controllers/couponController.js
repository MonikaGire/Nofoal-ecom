const Coupon = require('../models/Coupon');

// GET /api/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Coupon.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), coupons });
  } catch (err) {
    next(err);
  }
};

// GET /api/coupons/:id
exports.getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minPurchaseAmount, usageLimit, usagePerCustomer, validFrom, validUntil, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ success: false, message: 'Missing required fields', code: 'VALIDATION_ERROR' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minPurchaseAmount: minPurchaseAmount || 0,
      usageLimit: usageLimit || null,
      usagePerCustomer: usagePerCustomer || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists', code: 'CONFLICT' });
    }
    next(err);
  }
};

// PUT /api/coupons/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minPurchaseAmount, usageLimit, usagePerCustomer, validFrom, validUntil, isActive } = req.body;

    const update = {};
    if (code) update.code = code.toUpperCase();
    if (discountType) update.discountType = discountType;
    if (discountValue !== undefined) update.discountValue = discountValue;
    if (maxDiscount !== undefined) update.maxDiscount = maxDiscount;
    if (minPurchaseAmount !== undefined) update.minPurchaseAmount = minPurchaseAmount;
    if (usageLimit !== undefined) update.usageLimit = usageLimit;
    if (usagePerCustomer !== undefined) update.usagePerCustomer = usagePerCustomer;
    if (validFrom) update.validFrom = new Date(validFrom);
    if (validUntil) update.validUntil = new Date(validUntil);
    if (isActive !== undefined) update.isActive = isActive;
    update.updatedAt = new Date();

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons/validate — public endpoint to validate coupon at checkout
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, amount, userId } = req.body;
    const now = new Date();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code', code: 'NOT_FOUND' });
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ success: false, message: 'Coupon has expired or is not yet valid', code: 'COUPON_EXPIRED' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached', code: 'COUPON_LIMIT_REACHED' });
    }

    if (amount < coupon.minPurchaseAmount) {
      return res.status(400).json({ success: false, message: `Minimum purchase amount of Rs.${coupon.minPurchaseAmount} required`, code: 'MIN_PURCHASE_NOT_MET' });
    }

    // Check per-customer usage
    if (userId && coupon.usagePerCustomer) {
      const userUsage = coupon.usedBy.filter((id) => id.toString() === userId).length;
      if (userUsage >= coupon.usagePerCustomer) {
        return res.status(400).json({ success: false, message: 'You have already used this coupon', code: 'COUPON_ALREADY_USED' });
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    res.json({
      success: true,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discountAmount,
      finalAmount: amount - discountAmount,
    });
  } catch (err) {
    next(err);
  }
};
