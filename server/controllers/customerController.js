const User = require('../models/User');
const Order = require('../models/Order');
const PreOrder = require('../models/PreOrder');

// GET /api/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = 'newest' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
    };

    const [customers, total] = await Promise.all([
      User.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name email phone createdAt isActive'),
      User.countDocuments(filter),
    ]);

    // Enrich with order stats
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: customerIds } } },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => { statsMap[s._id.toString()] = s; });

    const enriched = customers.map((c) => {
      const stats = statsMap[c._id.toString()] || {};
      return {
        ...c.toObject(),
        totalOrders: stats.totalOrders || 0,
        totalSpent: stats.totalSpent || 0,
        lastOrderDate: stats.lastOrderDate || null,
      };
    });

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), customers: enriched });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'user' }).select('-password_hash');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found', code: 'NOT_FOUND' });
    }

    const [orders, preorders, stats] = await Promise.all([
      Order.find({ userId: customer._id }).sort({ createdAt: -1 }).limit(20),
      PreOrder.find({ email: customer.email }).sort({ createdAt: -1 }).limit(10),
      Order.aggregate([
        { $match: { userId: customer._id } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' }, avgOrder: { $avg: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      customer: customer.toObject(),
      orders,
      preorders,
      stats: stats[0] || { totalOrders: 0, totalSpent: 0, avgOrder: 0 },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/waitlist
exports.getWaitlist = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { waitlisted: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select('name email createdAt');
    res.json({ success: true, total: users.length, waitlist: users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, isActive } = req.body;
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'user' },
      { name, phone, isActive },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};
