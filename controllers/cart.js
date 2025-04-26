const cartService = require('../services/cartService');
const asyncHandler = require('express-async-handler');

exports.calculateOrderSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.calculateSummary(req.body.items);
  res.json(summary);
});
exports.addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addItem({
      userId: req.user.id,
      productId: req.body.productId,
      quantity: req.body.quantity
    });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};