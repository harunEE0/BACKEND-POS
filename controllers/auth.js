/**E:\learn-code\backend-pos\controllers\auth.js */

const User = require("../models/User");
const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const AuthService = require("../services/authService");
const SessionManager = require("../utils/sessionManager");
const { COOKIE_DOMAIN, NODE_ENV } = require("../config/env");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 5 login attempts per windowMs
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
  const { username, password, role, email } = req.body;

  if (!username || !password || !role || !email) {
    return res.status(400).json({
      success: false,
      error: "Please provide all required fields",
    });
  }

  try {
    // ตรวจสอบก่อนว่ามี user นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
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
      email,
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
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // ใช้ emailLogin แทน user เพื่อให้ชัดเจนว่าใช้ email ในการค้นหา
      const emailLogin = await User.findOne({ email }).select("+password");

      if (!emailLogin) {
        logger.warn(`Login attempt failed - Email not found: ${email}`);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const matchPassword = await emailLogin.comparePassword(password);

      if (!matchPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const sessionKey = await SessionManager.createSession(
        emailLogin._id.toString(),
        {
          id: emailLogin._id,
          username: emailLogin.username,
          email: emailLogin.email,
          role: emailLogin.role,
        }
      );

      logger.info(
        `User logged in: ${emailLogin.email} (ID: ${emailLogin._id})`
      );

      res
        .cookie("session_token", sessionKey, {
          httpOnly: true,
          secure: NODE_ENV === "production",
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
          domain: process.env.COOKIE_DOMAIN || 
         (process.env.NODE_ENV === 'development' ? 'localhost' : undefined)
        })
        .status(200)
        .json({
          success: true,
          user: {
            id: emailLogin._id,
            username: emailLogin.username,
            email: emailLogin.email,
            role: emailLogin.role,
          },
          sessionToken: sessionKey,
        });
    } catch (err) {
      logger.error(`Login error: ${err.message}`, { stack: err.stack });
      next(err);
    }
  },
];
//ดึงข้อมูลเเบบ id
exports.getUserId = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
//ดึงข้อมูลทั้งหมดในส่วนของ User
exports.GetallUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const sessionToken =req.cookies.session_token || 
                       req.headers.authorization?.split(' ')[1] || 
                       req.body.sessionToken;

     if (!sessionToken) {
      return res.status(400).json({ 
        success: false,
        error: "No active session found" 
      });
    }



      const session = await SessionManager.verifySession(sessionToken);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session"
      });
    }

    // ตรวจสอบว่า sessionToken มีรูปแบบที่ถูกต้อง
      // ตรวจสอบว่า session ถูกทำลายจริง
    const destroyed = await SessionManager.deleteSession(sessionToken);
    
    if (!destroyed) {
      logger.warn(`Session destruction failed for token: ${sessionToken}`);
      return res.status(500).json({ 
        success: false,
        error: "Logout failed - session not destroyed" 
      });
    }

    logger.info(`User logged out: ${req.user?.username || "Unknown"}`);

    
    res.clearCookie("session_token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      domain: COOKIE_DOMAIN || undefined,
    });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { username, password, email, role } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (username !== undefined) {
      user.username = username;
    }
    if (email !== undefined) {
      if (email !== user.email) {
        const exitingEmail = await User.findOne({ email });
        if (exitingEmail) {
          return res
            .status(400)
            .json({ success: false, message: "Email already exists" });
        }
      }
      user.email = email;
    }

    if (role !== undefined) {
      user.role = role;
    }
    if (password !== undefined) {
      user.password = password;
    }
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
