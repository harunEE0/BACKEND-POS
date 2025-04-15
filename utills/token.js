/**E:\learn-code\backend-pos\utills\token.js */
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE, COOKIE_DOMAIN } = require('../config/env');

exports.sendTokenResponse = (user, statusCode, res) => {
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

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    domain: COOKIE_DOMAIN || undefined,
    path: '/'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
};
