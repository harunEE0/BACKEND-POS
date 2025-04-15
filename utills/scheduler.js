const cron = require('node-cron');
const DashboardStats = require('../models/DashboardStats');

// อัปเดตสถิติทุกวันตอนเที่ยงคืน
cron.schedule('0 0 * * *', async () => {
  try {
    await DashboardStats.updateDashboardStats();
    console.log('Dashboard stats updated at', new Date());
  } catch (err) {
    console.error('Failed to update dashboard stats:', err);
  }
});