/**E:\learn-code\backend-pos\routes\dashboardRoute.js */
const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    forceUpdateDashboard,
    getProductsData,
    getTodayOrders,
    getCustomerCount,
    getTodayPayments
  } = require('../controllers/dahboard');
const  {protect,authorize} = require('../middleware/auth');

router.get('/', protect, getDashboardData);
router.post('/update', protect, authorize('admin'), forceUpdateDashboard);
router.get('/products', protect, getProductsData);
router.get('/today-orders', protect, getTodayOrders);
router.get('/customers', protect, getCustomerCount);
router.get('/today-payments', protect, getTodayPayments);

module.exports = router;