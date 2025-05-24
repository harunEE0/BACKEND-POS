//E:\learn-code\backend-pos\routes\cartRoute.js

const express = require('express');
const router = express.Router();
const {getCart,addToCart,updateCart,removeItem,clearCart,calculateOrderSummary} = require('../controllers/cart');
const {protect} = require('../middleware/auth');
const { validateCartItems} = require('../middleware/cartMiddleware'); 



router.post('/summary',validateCartItems,calculateOrderSummary)
router.use(protect)
router.get('/',getCart)
router.post('/add',validateCartItems,addToCart)
router.put('/:id',validateCartItems,updateCart)
router.delete('/:id',removeItem)
router.delete('/',clearCart)

module.exports = router;
