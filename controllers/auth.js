/**E:\learn-code\backend-pos\controllers\auth.js */

const User = require("../models/User");
const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const AuthService = require("../services/authService");
const sessionManager = require("../utils/sessionManager");
const { COOKIE_DOMAIN, NODE_ENV } = require("../config/env");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts from this IP, please try again later",
  handler: (req, res) => {
    logger.warn(`Too many login attempts from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: "Too many login attempts, please try again later",
    });
  },
});

exports.register = async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      error: "Please provide all required fields",
    });
  }

  try {
    // ตรวจสอบก่อนว่ามี user นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // สร้าง user ใหม่
    const user = await User.create({
      username,
      password,
      role,
    });

    // Log ข้อมูล user
    console.log("Created user:", user);

    // ส่ง response
    return AuthService.sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error: " + err.message,
    });
  }
};

exports.login = [
  loginLimiter,
  async (req, res, next) => {
    try {
      const { username, password, ip, userAgent } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "please provide username and password",
        });
      }

      const user = await User.findOne({ username }).select("+password");
      if (!user) {
        logger.warn(`Login attempt failed - User not found: ${username}`);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const matchPassword = await user.comparePassword(password);

      if (!matchPassword)
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });

      const sessionKey = await sessionManager.createSession(user._id.toString(), {
        id: user._id,
        username: user.username,
        role: user.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      logger.info(`User logged in: ${user.username} (ID: ${user._id})`);

      res.cookie("session_token", sessionKey, {
        httpOnly: true,
        secure: NODE_ENV === "production", // Set to true in production
        signed: true, // Use signed cookies if you have a secret
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        domain: COOKIE_DOMAIN, // Set your domain here
      });

       res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
        sessionToken: sessionKey // <-- ส่ง session token กลับไปด้วย
      });
     
    } catch (err) {
       logger.error(`Login error: ${err.message}`, { stack: err.stack });
    next(err);
    }
  },
];

exports.getme = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {

    const sessionToken = req.cookies.session_token;


    if (sessionToken) {
      await SessionManager.destroySession(sessionToken)
      logger.info(`User logged out: ${req.user?.username || 'Unknown'}`);
    }
     res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined
    });
     res.status(200).json({ 
      success: true 
    });
  } catch (err) {
      logger.error(`Logout error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};
