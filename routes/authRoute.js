//**E:\learn-code\backend-pos\routes\authRoute.js */

const express = require('express');
const router = express.Router();
const {protect ,authorize}= require('../middleware/auth');
const { login, register, getme, logout, refreshToken} = require('../controllers/auth');
const {checkSession} = require('../middleware/sessionCheck')



router.post('/register', register);
router.post('/admin/register', protect, authorize('admin'), register);
router.post('/login',checkSession, login);
router.get('/:id',protect, getme);
router.get('/logout',checkSession, logout);

module.exports = router;