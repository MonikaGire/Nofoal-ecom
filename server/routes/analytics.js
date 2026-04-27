const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getSalesAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardMetrics);
router.get('/sales', getSalesAnalytics);

module.exports = router;
