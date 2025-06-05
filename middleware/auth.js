//E:\learn-code\backend-pos\middleware\auth.js

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const User = require("../models/User");
const SessionManager = require("../utils/sessionManager");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
   
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
  const currentUser = await User.findById(decoded.id)
   if (!currentUser) {
    return (new ErrorResponse('The user belonging to this token no longer exists', 401));
   }
   if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new ErrorResponse('User recently changed password! Please log in again', 401));
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};



const requireAuth = async (req, res, next) => {
  try {
   
    let token = req.cookies?.session_token || 
               req.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // ตรวจสอบรูปแบบ token
    if (!token.startsWith('session:')) {
      return res.status(400).json({ success: false, message: "Invalid token format" });
    }

    const session = await SessionManager.verifySession(token);
    if (!session) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }

    req.user = session;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


// Middleware สำหรับตรวจสอบสิทธิ์ในร้านค้า
const checkStorePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const storeId = req.params.storeId || req.body.storeId;
      const userId = req.user._id;

      if (!storeId) {
        return next(new ErrorResponse('Store ID is required', 400));
      }

      // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในร้านค้านี้หรือไม่
      const storeUser = await StoreUser.findOne({ 
        user: userId, 
        store: storeId 
      }).populate('store');

      if (!storeUser) {
        return next(new ErrorResponse('You have no permission in this store', 403));
      }

      // ตรวจสอบสิทธิ์ตามระดับที่ต้องการ
      if (requiredPermission === 'owner' && storeUser.role !== 'owner') {
        return next(new ErrorResponse('Owner permission required', 403));
      }

      if (requiredPermission === 'admin' && !['owner', 'admin'].includes(storeUser.role)) {
        return next(new ErrorResponse('Admin permission required', 403));
      }

      if (requiredPermission === 'cashier' && !['owner', 'admin', 'cashier'].includes(storeUser.role)) {
        return next(new ErrorResponse('Cashier permission required', 403));
      }

      // เซ็ตข้อมูลร้านและบทบาทสำหรับใช้ใน controller ต่อไป
      req.store = storeUser.store;
      req.storeRole = storeUser.role;
      
      next();
    } catch (error) {
      logger.error(`Store permission check error: ${error.message}`);
      next(error);
    }
  };
};

// Middleware สำหรับตรวจสอบว่าเป็นเจ้าของร้าน
const isStoreOwner = checkStorePermission('owner');

// Middleware สำหรับตรวจสอบว่าเป็น admin ขึ้นไป
const isStoreAdmin = checkStorePermission('admin');

// Middleware สำหรับตรวจสอบว่าเป็น cashier ขึ้นไป
const isStoreCashier = checkStorePermission('cashier');

module.exports = { 
   protect, 
  requireAuth,
  checkStorePermission,
  isStoreOwner,
  isStoreAdmin,
  isStoreCashier
};
