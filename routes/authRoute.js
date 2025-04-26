//**E:\learn-code\backend-pos\routes\authRoute.js */

const express = require('express');
const router = express.Router();
const {protect ,authorize}= require('../middleware/auth');

const { login, register, getme, logout, refreshToken} = require('../controllers/auth');



router.post('/register', register);
router.post('/admin/register', protect, authorize('admin'), register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me',protect, getme);
router.get('/logout',protect, logout);

module.exports = router;