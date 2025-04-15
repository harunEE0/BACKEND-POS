//**backen-pos/route/inventoryRoute.js */
const express = require('express');
const router = express.Router();

const {protect} = require('../middleware/auth');

const {getInventoryLogs,adjustStock,getLowStockProducts} = require('../controllers/inventory');


router
    .route('/logs')
    .get(protect,getInventoryLogs);

router
    .route('/adjust')
    .post(protect,adjustStock);

router
    .route('/low-stock')
    .get(protect,getLowStockProducts);


    module.exports = router;