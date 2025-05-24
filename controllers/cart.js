//E:\learn-code\backend-pos\controllers\cart.js

const cartService = require('../services/cartService');
const asyncHandler = require('express-async-handler');

exports.calculateOrderSummary = asyncHandler(async (req, res) => {
  const summary = await cartService.calculateSummary(req.body.items);
  res.json(summary);
});


exports.addToCart = asyncHandler (async(req, res, next)=>{
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
}) 



exports.getCart = asyncHandler (async(req, res, next)=>{
    {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};
})


exports.removeItem = asyncHandler (async(req, res, next)=>{
    try {
      const cart = await cartService.removeItem(req.user.id, req.params.productId);
  res.json(cart);
  } catch (error) {
    next(error);
    
  }
}) 



exports.updateCart = asyncHandler (async(req, res, next)=>{
    {
  try {
     const cart = await cartService.updateItemQuantity({
    userId: req.user.id,
    productId: req.params.productId,
    quantity: req.body.quantity
  });
  res.json(cart);
  } catch (error) {
    next(error);
    
  }
}
})





exports.clearCart = asyncHandler (async(req, res, next)=>{
   try {
     const result = await cartService.clearCart(req.user.id);
  res.json(result);
  } catch (error) {
    next(error);
    
  }
}) 