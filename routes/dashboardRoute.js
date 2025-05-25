/**E:\learn-code\backend-pos\routes\dashboardRoute.js */
const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    forceUpdateDashboard,
    getProductsData,
    getTodayOrders,
    getCustomers,
    getTodayPayments
  } = require('../controllers/dashboard');
const  {protect,authorize,requireAuth} = require('../middleware/auth');

router.get('/', requireAuth, getDashboardData);
router.post('/update', requireAuth, authorize('admin'), forceUpdateDashboard);
router.get('/products', requireAuth, getProductsData);
router.get('/today-orders', requireAuth, getTodayOrders);
router.get('/customers',requireAuth, getCustomers);
router.get('/today-payments', requireAuth, getTodayPayments);

module.exports = router;