//E:\learn-code\backend-pos\events\dashboardEvents.js
const { default: mongoose } = require('mongoose');
const DashboardStats = require('../models/DashboardStats');
const customer = require('../models/customer');
const Customer = require('../models/customer');
const cacheServices = require('../services/cacheService')
const logger = require('../utils/logger');

// ใช้ Polling แทน Change Stream
let lastStats = {
      customerCount:0,
      orderCount: 0,
      paymentTotal:0
};
const updateDashboardAndCache = async () =>{
  try {
    const updateStats = await DashboardStats.updateDashboard();
     logger.info('Dashboard updated successfully');
     return updateStats;
  } catch (error) {
    logger.error(`Error updating dashboard and cache: ${error.message}`);
    
  }
}

const checkForUpdates = async () => {
  try {
    const currentCustomerCount = await Customer.countDocuments();
    const currentOrderCount = await mongoose.model('Order')
                                    .countDocuments({createdAt:{$gte:new Date().setHours(0, 0, 0, 0)}});

    const currentPaymentTotal = await mongoose.model('Payment')
                                      .aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])        
                                      
    const shouldUpdate = 
      currentCustomerCount !== lastStats.customerCount ||
      currentOrderCount !== lastStats.orderCount ||
      currentPaymentTotal[0]?.total !== lastStats.paymentTotal;
      
      if(shouldUpdate){
        await updateDashboardAndCache();
        lastStats = {
          customerCount: currentCustomerCount,
          orderCount: currentOrderCount,
          paymentTotal: currentPaymentTotal[0]?.total || 0
        }
      }

  } catch (err) {
    logger.error(`Polling error: ${err.message}`);
  }
};

// ตั้งเวลา interval
const pollingInterval = setInterval(checkForUpdates, 10000);

// อัปเดตทุก 1 ชั่วโมัง
const scheduledUpdateInterval = setInterval(updateDashboardAndCache, 3600000);


process.on('SIGINT',()=>{
  clearInterval(pollingInterval);
  clearInterval(scheduledUpdateInterval);
  logger.info('Polling intervals cleared');
  process.exit();
})

// อัปเดตครั้งแรกเมื่อเริ่มเซิร์ฟเวอร์
checkForUpdates();