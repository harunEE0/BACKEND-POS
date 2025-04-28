/**E:\learn-code\backend-pos\controllers\auth.js */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {JWT_SECRET,JWT_EXPIRE,NODE_ENV } = require('../config/env');
const rateLimit = require('express-rate-limit');
const logger  = require('../utills/logger');

exports.register = async (req, res, next) => {
    const { username, password, role } = req.body;
    if (!['admin', 'cashier'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
 
    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            error: 'Please provide username, password and role'
        });
    }
    
    try {
        const user = await User.create({ username, password, role });
        console.log(sendTokenResponse(user, 201, res));
        res.send(sendTokenResponse(user, 201, res))
    } catch (err) {
        console.error('Registration Error:', err);
        
       
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};


exports.login = async (req,res,next) =>{
    try{
        const {username,password} = req.body;
        if(!username || !password){
            return res.status(400).json({success: false , message:'please provide username and password'})
        };

        const user = await User.findOne({username}).select('+password');
        console.log("USER FOUND:", user);
       
        if(!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const matchPassword = await user.comparePassword(password);

        if(!matchPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        logger.info(`User logged in: ${user.username}`);
        console.log(sendTokenResponse(user, 201, res));
        res.send(sendTokenResponse(user, 201, res))
    }catch(err){
        next(err)
        logger.error(`Login error: ${err.message}`);
    }
};
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  handler: (req, res) => {
    res.status(429).json({ 
      success: false,
      error: 'Too many login attempts' 
    });
  }
});



exports.getme = async (req,res,next) =>{
    try{
        const user = await User.findById(req.user.id);
        res.status(200).json({success: true,data: user });



    }catch(err){
        next(err)
    }
}


exports.logout = async (req,res,next) =>{
    try{
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            signed: true
          });
          res.status(200).json({
            success: true,
            data: {},
          });
    }catch(err){
        next(err)
    }
}
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error('No refresh token');
    
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  try {
    // 1. ตรวจสอบข้อมูล user
    if (!user || !user._id || !user.username || !user.role) {
      throw new Error('Invalid user data');
    }

    // 2. สร้าง token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRE,
        algorithm: 'HS256'
      }
    );

    // 3. ตั้งค่า cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
      domain: process.env.COOKIE_DOMAIN,
      path: '/',
      // signed: false // ลบออกหรือไม่ต้องกำหนด
    };

    // 4. ส่ง response
    res
      .status(statusCode)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token, // ส่ง token กลับใน response body ด้วย (สำหรับ client ที่ไม่ใช้ cookie)
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });

  } catch (err) {
    console.error('Error in sendTokenResponse:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate token' 
    });
  }
};
