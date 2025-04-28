//E:\learn-code\backend-pos\services\dashboardService.js
const DashboardStats = require('../models/DashboardStats');
const logger = require('../utills/logger');

exports.updateDashboard = async () => {
  try {
    const updatedStats = await DashboardStats.updateDashboard();
    logger.info('Dashboard updated at ' + new Date().toISOString());
    return updatedStats;
  } catch (err) {
    logger.error('Dashboard update failed: ' + err.message, {
      error: err.stack,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to update dashboard');
  }
};

exports.getDashboardData = async (options = {}) => {
  try {
    return await DashboardStats.findOne({})
      .lean()
      .setOptions(options);
  } catch (err) {
    logger.error('Failed to get dashboard data: ' + err.message);
    throw err;
  }
};