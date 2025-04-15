//**backen-pos/route/customerRoute.js */

const express = require('express');
const router = express.Router();
const {protect}= require('../middleware/auth');

const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customer')



router
  .route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router
  .route('/:id')
  .get(protect, getCustomer)
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

module.exports = router;