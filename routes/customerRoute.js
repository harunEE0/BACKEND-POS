//**backen-pos/route/customerRoute.js */

const express = require('express');
const router = express.Router();
const {protect,requireAuth}= require('../middleware/auth');

const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customer')



router
  .route('/')
  .get(requireAuth, getCustomers)
  .post(requireAuth, createCustomer);

router
  .route('/:id')
  .get(requireAuth, getCustomer)
  .put(requireAuth, updateCustomer)
  .delete(requireAuth, deleteCustomer);

module.exports = router;