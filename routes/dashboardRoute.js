/**E:\learn-code\backend-pos\routes\dashboardRoute.js */
const express = require('express');
const router = express.Router();
const { getById, getAll } = require('../controllers/dahboard');
const  {protect} = require('../middleware/auth');

// รับข้อมูลสถิติแดชบอร์ดจาก ID
router.get('/:id', protect, getById);

// รับข้อมูลสถิติแดชบอร์ดทั้งหมด
router.get('/', protect, getAll);

module.exports = router;