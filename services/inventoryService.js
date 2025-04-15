/**backend-pos/services/inventoryService */
const InventoryLog = require('../models/inventory');
const Product = require('../models/product');

exports.getLogs = async () => {
  return await InventoryLog.find().sort({ createdAt: -1 });
};

exports.adjustStock = async ({ productId, change, reason }) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  product.stock += change;
  await product.save();

  const log = await InventoryLog.create({
    product: productId,
    change,
    reason
  });

  return { product, log };
};

exports.getLowStock = async () => {
  return await Product.find({ stock: { $lt: 10 } }); // Low stock threshold
};
