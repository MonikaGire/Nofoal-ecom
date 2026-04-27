const Order = require('../models/Order');
const PreOrder = require('../models/PreOrder');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/analytics/dashboard
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrdersToday,
      totalOrdersMonth,
      revenueToday,
      revenueMonth,
      revenueYear,
      totalOrders,
      totalPreorders,
      pendingPreorders,
      totalCustomers,
      newCustomersMonth,
      totalProducts,
      lowStockProducts,
      recentOrders,
      revenueLast7Days,
      orderStatusCounts,
      topProducts,
    ] = await Promise.all([
      // Orders today
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      // Orders this month
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      // Revenue today (paid orders)
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      // Revenue this month
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      // Revenue this year
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: yearStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      // Total orders
      Order.countDocuments({}),
      // Total pre-orders
      PreOrder.countDocuments({}),
      // Pending pre-orders
      PreOrder.countDocuments({ status: 'pending' }),
      // Total customers
      User.countDocuments({ role: 'user' }),
      // New customers this month
      User.countDocuments({ role: 'user', createdAt: { $gte: monthStart } }),
      // Total active products
      Product.countDocuments({ isActive: true }),
      // Low stock products (inventory <= 10)
      Product.countDocuments({ isActive: true, inventory: { $lte: 10 } }),
      // Recent orders (last 10)
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('customerName customerEmail totalAmount status createdAt items'),
      // Revenue per day - last 7 days
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: last7Days } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      // Order status distribution
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Top products by order count (last 30 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Format revenue chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const match = revenueLast7Days.find(
        (r) =>
          r._id.year === d.getFullYear() &&
          r._id.month === d.getMonth() + 1 &&
          r._id.day === d.getDate()
      );
      chartData.push({ date: label, revenue: match ? match.revenue : 0, orders: match ? match.orders : 0 });
    }

    res.json({
      success: true,
      metrics: {
        revenue: {
          today: revenueToday[0]?.total || 0,
          month: revenueMonth[0]?.total || 0,
          year: revenueYear[0]?.total || 0,
        },
        orders: {
          total: totalOrders,
          today: totalOrdersToday,
          month: totalOrdersMonth,
        },
        preorders: {
          total: totalPreorders,
          pending: pendingPreorders,
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersMonth,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
      },
      recentOrders,
      revenueChart: chartData,
      orderStatusChart: orderStatusCounts,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/sales?period=7d|30d|3m|1y
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();

    let startDate;
    let groupBy;
    if (period === '7d') {
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === '30d') {
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === '3m') {
      startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const [salesData, topProducts, categoryRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: startDate } } },
        { $group: { _id: groupBy, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmpty: true } },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    res.json({ success: true, salesData, topProducts, categoryRevenue });
  } catch (err) {
    next(err);
  }
};
