//**backen-pos/route/orderRoute.js */
 

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
    getOrders,
    createOrder,
    updateOrderStatus,
} = require('../controllers/order')


router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id')
  .get(protect, getOrders)
  .put(protect, updateOrderStatus);

module.exports = router;