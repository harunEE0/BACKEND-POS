//**backen-pos/route/paymentRoute.js */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    processPayment,
    getPayments,
} = require('../controllers/payment')


router
  .route('/')
  .get(protect, getPayments)
  .post(protect, processPayment);

module.exports = router;