//**E:\learn-code\backend-pos\routes\authRoute.js */

const express = require('express');
const router = express.Router();
const {protect }= require('../middleware/auth');
const { login, register, getUserId, logout,GetallUsers , updateUser} = require('../controllers/auth');
const {requireAuth} = require('../middleware/auth');



router.post('/register', register);
router.post('/login',login);
router.get('/Allusers',requireAuth,GetallUsers)

router
  .route('/:id')
  .get(requireAuth, getUserId)
  .put(requireAuth, updateUser);

router.post('/logout',requireAuth, logout);
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;