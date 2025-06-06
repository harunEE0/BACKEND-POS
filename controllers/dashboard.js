/**E:\learn-code\backend-pos\controllers\dahboard.js */
const asyncHandler = require('express-async-handler');
const DashboardStats = require('../models/DashboardStats');
const logger = require('../utils/logger');
const cacheService  = require('../services/cacheService');
const {redisClient} = require('../config/redis');

const CACHE_TTL = 300

const getCachedData = async (key) =>{
  try {
    const cachedData = await  cacheService .get(key);
    return cachedData? JSON.parse(cachedData) : null;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}: ${error.message}`);
    throw error;
    
  }
};


function isDataStale(lastupdate){
  const now = new Date();
  const lastUpdateTime = new Date(lastupdate);
  return (now - lastUpdateTime) > (CACHE_TTL * 1000);
}

exports.getDashboardData = asyncHandler(async (req, res) => {
  try {
    const cacheKey = 'dashboard_stats';
    const cachedData = await getCachedData(cacheKey);

    // 1. ตรวจสอบว่ามีข้อมูลใน cache และไม่ล้าสมัย
    if (cachedData && isDataStale(cachedData.lastUpdated)) {
      logger.info('serving dashboard data from cache');
      return res.json({
        success: true,
        fromCache: true,
        ...cachedData
      });
    };

    // 2. ดึงข้อมูลจาก database
    let data = await DashboardStats.findOne({}).lean();
    if(!data || isDataStale(data.lastUpdated)){
      logger.info('Dashboard data is stale, updating...');
      data = await DashboardStats.updateDashboard();
    }

    await cacheService.setex(cacheKey, CACHE_TTL, JSON.stringify(cachedData));
    
    res.json({
      success: true,
      fromCache: false,
      data
    })

  
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


exports.getCustomers  = asyncHandler(async (req, res) => {
  const data = await DashboardStats.findOne({}).select('customers  lastUpdated');
  res.json({
    success: true,
    lastUpdated: data.lastUpdated,
    count: data.customers.length,
    customers: data.customers
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




exports.getStoreStats = asyncHandler(async (req, res, next) => {
  const { storeId } = req.params;
  
  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในร้านค้านี้
  const userRole = await UserStoreRole.findOne({
    user: req.user.id,
    store: storeId
  });
  
  if (!userRole) {
    return next(new ErrorResponse('Not authorized to access this store', 403));
  }
  
  // ดึงข้อมูลสถิติของร้านค้า
  const stats = await DashboardStats.findOne({ store: storeId });
  
  res.status(200).json({
    success: true,
    data: stats
  });
});