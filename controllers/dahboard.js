/**E:\learn-code\backend-pos\controllers\dahboard.js */
const { Console } = require('winston/lib/winston/transports');
const dashboardService = require('../services/dashboardService');
const asyncHandler = require('express-async-handler');

exports.getById = asyncHandler(async (req, res) => {
  const stat = await dashboardService.getStatById(req.params.id);
  Console.log(stat);
  res.json(stat);
});

exports.getAll = asyncHandler(async (_req, res) => {
  const stats = await dashboardService.getAllStats();
  res.json(stats);
});

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await DashboardStats.findOne({});
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};