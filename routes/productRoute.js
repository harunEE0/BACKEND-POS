//**backend-pos/routes/productRoute */
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const {
  getProducts,
  getProduct,
  createProduct,  
  updateProduct,
  deleteProduct
} = require('../controllers/product');

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProduct)  // เปลี่ยนจาก getProduct เป็น GetProductId ให้ตรงกับ controller
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;