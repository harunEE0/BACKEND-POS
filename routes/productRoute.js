//**backend-pos/routes/productRoute */
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

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
  .post(protect, createProduct);

router
  .route('/:id')
  .get(getProduct)  // เปลี่ยนจาก getProduct เป็น GetProductId ให้ตรงกับ controller
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;