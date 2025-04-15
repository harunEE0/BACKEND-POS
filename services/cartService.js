/**backend-pos/services/cartService */
const Product = require('../models/product');

exports.calculateSummary = async (items) => {
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    subtotal += product.price * item.quantity;
  }

  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total
  };
};
