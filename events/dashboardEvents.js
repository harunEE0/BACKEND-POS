//E:\learn-code\backend-pos\events\dashboardEvents.js
const DashboardStats = require('../models/DashboardStats');
const Customer = require('../models/customer');
const logger = require('../utils/logger');

// ใช้ Polling แทน Change Stream
let lastCustomerCount = 0;

const checkForUpdates = async () => {
  try {
    const currentCount = await Customer.countDocuments();
    
    if (currentCount !== lastCustomerCount) {
      await DashboardStats.updateDashboard();
      logger.info(`Dashboard updated. Customer count changed from ${lastCustomerCount} to ${currentCount}`);
      lastCustomerCount = currentCount;
    }
  } catch (err) {
    logger.error(`Polling error: ${err.message}`);
  }
};

// ตรวจสอบทุก 5 วินาที
setInterval(checkForUpdates, 5000);

// อัปเดต Dashboard ทุก 1 ชั่วโมง
setInterval(async () => {
  await DashboardStats.updateDashboard();
  logger.info('Scheduled dashboard update completed');
}, 3600000);

// อัปเดตครั้งแรกเมื่อเริ่มเซิร์ฟเวอร์
checkForUpdates();