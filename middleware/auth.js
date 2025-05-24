//E:\learn-code\backend-pos\middleware\auth.js

const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/env');
const User = require('../models/User');
const SessionManager = require('../utils/sessionManager');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');


 const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAuth = async (req, res , next) => {
  try {
  let token;
    
     // ตรวจสอบทั้งใน cookies และ headers
   if (req.cookies?.session_token) {
      token = req.cookies.session_token;
    } else if (req.headers?.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers?.session_token) {
      token = req.headers.session_token;
    }

    // ตรวจสอบการมีอยู่ของ token
    if (!token) {
      logger.warn('No session token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

     // ตรวจสอบรูปแบบ token อย่างละเอียด
    if (typeof token !== 'string' || !token.startsWith('session:')) {
      logger.warn(`Malformed token received: ${token}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid token format - must start with "session:"'
      });
    }

    // ตรวจสอบ session
    const session = await SessionManager.verifySession(token);
    if (!session) {
      logger.warn(`Invalid session for token: ${token}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    req.user = session;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`, { stack: error.stack });
    next(error);
    
  }
}




module.exports = {authorize, protect, auth,requireAuth};