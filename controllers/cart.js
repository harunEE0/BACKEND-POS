const cartService = require('../services/cartService');
const asyncHandler = require('express-async-handler');

exports.calculateOrderSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.calculateSummary(req.body.items);
  res.json(summary);
});
