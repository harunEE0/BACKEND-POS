/**backend-pos/controller/inventory */


const InventoryLog = require('../models/inventory')
const Product =  require('../models/product')


exports.getInventoryLogs = async (req, res, next) => {
    try {
      let query = InventoryLog.find()
        .populate('product', 'name')
        .populate('user', 'username')
        .sort('-createdAt');
  
      if (req.query.productId) {
        query = query.where('product').equals(req.query.productId);
      }
  
      if (req.query.type) {
        query = query.where('type').equals(req.query.type);
      }
  
      const logs = await query;
  
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.adjustStock = async (req, res, next) => {
    try {
      const { productId, quantity, note } = req.body;
  
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
  
      const newStock = product.stock + quantity;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
      }
  
      // Update product stock
      product.stock = newStock;
      await product.save();
  
      // Create inventory log
      const log = await InventoryLog.create({
        product: productId,
        quantity: Math.abs(quantity),
        type: quantity > 0 ? 'in' : 'out',
        reference: 'manual adjustment',
        user: req.user.id,
        note,
      });
  
      res.status(201).json({
        success: true,
        data: log,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getLowStockProducts = async (req, res, next) => {
    try {
      const threshold = req.query.threshold || 10;
      const products = await Product.find({ stock: { $lt: threshold } }).sort('stock');
  
      res.status(200).json({
        success: true,
        count: products.length,
        threshold,
        data: products,
      });
    } catch (err) {
      next(err);
    }
  };