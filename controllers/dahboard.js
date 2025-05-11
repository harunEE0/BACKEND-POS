/**E:\learn-code\backend-pos\controllers\dahboard.js */
const asyncHandler = require('express-async-handler');
const DashboardStats = require('../models/DashboardStats');
const logger = require('../utils/logger');
const catcheService = require('../services/cacheService');



exports.getDashboardData = asyncHandler(async (req, res) => {
  try {
    const cacheKey = 'dashboard_stats';
    const cachedData = await cacheService.get(cacheKey);

    // 1. ตรวจสอบว่ามีข้อมูลใน cache และไม่ล้าสมัย
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const isStale = !parsedData || 
        (Date.now() - new Date(parsedData.lastUpdated).getTime()) > 300000;
      
      if (!isStale) {
        logger.info('Serving from cache');
        return res.json({
          success: true,
          fromCache: true,
          lastUpdated: parsedData.lastUpdated,
          products: parsedData.products,
          todayOrders: parsedData.todayOrders,
          customerCount: parsedData.customerCount,
          todayPayments: parsedData.todayPayments
        });
      }
    }

    // 2. ดึงข้อมูลจาก database
    let data = await DashboardStats.findOne({}).lean();
    
    // 3. ตรวจสอบว่าข้อมูลล้าสมัยหรือไม่
    const isStale = !data || (Date.now() - new Date(data.lastUpdated).getTime()) > 300000;
    
    if (isStale) {
      logger.info('Dashboard data is stale, updating...');
      data = await DashboardStats.updateDashboard();
    }

    // 4. บันทึกข้อมูลลง cache เป็นเวลา 5 นาที
    await cacheService.setex(cacheKey, 300, JSON.stringify({
      lastUpdated: data.lastUpdated,
      products: data.products,
      todayOrders: data.todayOrders,
      customerCount: data.customerCount,
      todayPayments: data.todayPayments
    }));

    // 5. ส่ง response
    res.json({
      success: true,
      fromCache: false,
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