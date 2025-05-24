const cartService = require('../services/cartService');
const ErrorResponse = require('../utils/ErrorResponse');

// Middleware เพื่อตรวจสอบว่าสินค้าในตะกร้ามีอยู่จริง
exports.validateCartItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new ErrorResponse('Cart items are required', 400));
    }

    // ตรวจสอบสินค้าแต่ละรายการ
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return next(new ErrorResponse('Each item must have productId and quantity', 400));
      }
      
      if (item.quantity <= 0) {
        return next(new ErrorResponse('Quantity must be greater than 0', 400));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware เพื่อตรวจสอบว่าตะกร้ามีสินค้าหรือไม่
exports.checkCartNotEmpty = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    if (cart.items.length === 0) {
      return next(new ErrorResponse('Cart is empty', 400));
    }
    next();
  } catch (error) {
    next(error);
  }
};