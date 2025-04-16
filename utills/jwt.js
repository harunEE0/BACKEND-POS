/**E:\learn-code\backend-pos\utills\jwt.js*/

const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRE, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRE } = require('../config/env');

exports.generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE || '15m',
      issuer: 'pos-api',
      audience: 'pos-client'
    });
  };
  
  // สร้าง refresh token
  exports.generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET || JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE || '7d',
      issuer: 'pos-api',
      audience: 'pos-client'
    });
  };
  
  // ตรวจสอบ token
  exports.verifyToken = (token, isRefresh = false) => {
    return jwt.verify(token, isRefresh ? REFRESH_TOKEN_SECRET : JWT_SECRET);
  };
  
  // ส่ง token response
  exports.sendTokenResponse = (user, statusCode, res) => {
    const accessToken = this.generateAccessToken({
      id: user._id,
      role: user.role,
      username: user.username
    });
  
    const refreshToken = this.generateRefreshToken({
      id: user._id
    });
  
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined
    };
  
    res
      .status(statusCode)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, { ...cookieOptions, path: '/api/v1/auth/refresh' })
      .json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
  };