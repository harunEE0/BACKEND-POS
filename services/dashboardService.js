/**backend-pos/services/dashboardService */
const DashboardStats = require('../models/DashboardStats');

exports.getStatById = async (id) => {
  return await DashboardStats.findById(id);
};

exports.getAllStats = async () => {
  return await DashboardStats.find();
};
