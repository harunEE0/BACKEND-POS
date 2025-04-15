//backend-pos/controller/product
const Product = require('../models/product');
const InventoryLog = require('../models/inventory');
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
    console.log(products);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    console.log(product);
    // Log inventory change
    if (product.stock > 0) {
      await InventoryLog.create({
        product: product._id,
        quantity: product.stock,
        type: 'in',
        reference: 'initial stock',
        user: req.user.id,
      });
    }

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    console.log(product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Handle stock adjustment
    if (req.body.stock !== undefined && req.body.stock !== product.stock) {
      const diff = req.body.stock - product.stock;
      const type = diff > 0 ? 'in' : 'out';

      await InventoryLog.create({
        product: product._id,
        quantity: Math.abs(diff),
        type,
        reference: 'manual adjustment',
        user: req.user.id,
        note: `Stock adjusted from ${product.stock} to ${req.body.stock}`,
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};