//**E:\learn-code\backend-pos\routes\authRoute.js */

const express = require('express');
const router = express.Router();
const {protect}= require('../middleware/auth');

const {login,register,getme,logout} = require('../controllers/auth');



router.post('/register', register);
router.post('/login', login);
router.get('/me',protect, getme);
router.get('/logout',protect, logout);

module.exports = router;