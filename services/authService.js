/**E:\learn-code\backend-pos\services\authService.js */

const jwt = require('jsonwebtoken');
const {JWT_EXPIRE,JWT_SECRET,NODE_ENV,COOKIE_DOMAIN} =require('../config/env');

class AuthService {
   // Generate JWT Token
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRE,
        algorithm: 'HS256'
      }
    );
  }

  // Send token response
  async sendTokenResponse(user, statusCode, res) {
    try {
      const token = this.generateToken(user);

      // Cookie options
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        domain: COOKIE_DOMAIN,
        path: '/'
      };

      // Remove password from output
      user.password = undefined;

      res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
          success: true,
          token,
          user
        });

    } catch (error) {
      logger.error(`Error in sendTokenResponse: ${error.message}`);
      throw error;
    }
  }

  // Validate user registration data
  validateRegistrationData(data) {
    const { username, email, password, role } = data;
    
    if (!username || !email || !password || !role) {
      throw new Error('Please provide all required fields');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!['admin', 'cashier'].includes(role)) {
      throw new Error('Invalid role specified');
    }
  }

  refreshToken = async (req, res, next) => {
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
 
  sendTokenResponse = async  (user, statusCode, res) => {
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
        secure: NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
        domain: COOKIE_DOMAIN,
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
 
}

module.exports = new AuthService();

