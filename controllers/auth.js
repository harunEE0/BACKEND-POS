/**backend-pos/controller/auth */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {JWT_SECRET,JWT_EXPIRE} = require('../config/env');


exports.register = async (req, res, next) => {
    const { username, password, role } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            error: 'Please provide username, password and role'
        });
    }
    
    try {
        const user = await User.create({ username, password, role });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Registration Error:', err);
        
        // จัดการข้อผิดพลาดเฉพาะกรณี
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

        if(!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const matchPassword = await user.comparePassword(password,user.password);

        if(!matchPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        sendTokenResponse(user,200,res);
    }catch(err){
        next(err)
    }
};


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
          });
          res.status(200).json({
            success: true,
            data: {},
          });
    }catch(err){
        next(err)
    }
}


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
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/'
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
    throw err; // หรือจัดการ error ตามที่คุณต้องการ
  }
};
