const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../utils/errors');

// ดึงข้อมูล product ทั้งหมด
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err); // ส่ง error ไปยัง error handling middleware
  }
};

// สร้าง product ใหม่
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;

    // ตรวจสอบข้อมูลที่ส่งมา
    if (!name || !description || !price || !stock) {
      throw new ValidationError('Missing required fields');
    }

    const product = new Product({ name, description, price, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err); // ส่ง error ไปยัง error handling middleware
  }
};

// ดึงข้อมูล product โดย ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (err) {
    next(err); // ส่ง error ไปยัง error handling middleware
  }
};

// อัปเดต product
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock },
      { new: true }
    );
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (err) {
    next(err); // ส่ง error ไปยัง error handling middleware
  }
};

// ลบ product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err); // ส่ง error ไปยัง error handling middleware
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
};