const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, updateCustomer, getWaitlist } = require('../controllers/customerController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect, adminOnly);

router.get('/waitlist', getWaitlist);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

module.exports = router;
