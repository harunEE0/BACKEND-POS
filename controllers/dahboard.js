/**E:\learn-code\backend-pos\controllers\dahboard.js */
const { Console } = require('winston/lib/winston/transports');
const asyncHandler = require('express-async-handler');
const DashboardStats = require('../models/DashboardStats');
const logger = require('../utills/logger');






exports.getDashboardData = asyncHandler(async (req, res) => {
  try {
    // ตรวจสอบข้อมูลใน Database
    let data = await DashboardStats.findOne({})
      .lean()
      

    
    const isStale = !data || (Date.now() - new Date(data.lastUpdated).getTime()) > 300000;
    
    if (isStale) {
      logger.info('Dashboard data is stale, updating...');
      data = await DashboardStats.updateDashboard();
    }

    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      products: data.products,
      todayOrders: data.todayOrders,
      customerCount: data.customerCount,
      todayPayments: data.todayPayments
    });
  } catch (err) {
    logger.error(`Dashboard Error: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});


exports.forceUpdateDashboard = asyncHandler(async (req, res) => {
  try {
    const data = await DashboardStats.updateDashboard();
    logger.info('Dashboard manually updated');
    
    res.json({
      success: true,
      message: 'Dashboard updated successfully',
      lastUpdated: data.lastUpdated
    });
  } catch (err) {
    logger.error(`Manual Update Error: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Update failed'
    });
  }
});


exports.getProductsData = asyncHandler(async (req, res) => {
  const data = await DashboardStats.findOne({}).select('products lastUpdated');
  res.json({
    success: true,
    lastUpdated: data.lastUpdated,
    products: data.products
  });
});


exports.getTodayOrders = asyncHandler(async (req, res) => {
  const data = await DashboardStats.findOne({}).select('todayOrders lastUpdated');
  res.json({
    success: true,
    lastUpdated: data.lastUpdated,
    orders: data.todayOrders
  });
});


exports.getCustomerCount = asyncHandler(async (req, res) => {
  const data = await DashboardStats.findOne({}).select('totalCustomers lastUpdated');
  res.json({
    success: true,
    lastUpdated: data.lastUpdated,
    count: data.totalCustomers
  });
});


exports.getTodayPayments = asyncHandler(async (req, res) => {
  const data = await DashboardStats.findOne({}).select('todayPayments lastUpdated');
  res.json({
    success: true,
    lastUpdated: data.lastUpdated,
    payments: data.todayPayments
  });
});