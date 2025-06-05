
//E:\learn-code\backend-pos\middleware\storeMiddleware.js


const StoreUser = require('../models/store/storeUser');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');

// ตรวจสอบว่าผู้ใช้สามารถเข้าถึงร้านค้านี้ได้
exports.isStoreOwner = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;
    const userId = req.user.id;
    
    const storeUser = await StoreUser.findOne({ 
      store: storeId, 
      user: userId,
      role: 'owner'
    });
    
    if (!storeUser) {
      return next(new ErrorResponse('คุณไม่มีสิทธิ์ในการดำเนินการนี้', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ในร้าน (owner/admin/cashier)
exports.hasStoreAccess = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;
    const userId = req.user.id;
    
    const storeUser = await StoreUser.findOne({ 
      store: storeId, 
      user: userId
    });
    
    if (!storeUser) {
      return next(new ErrorResponse('คุณไม่มีสิทธิ์เข้าถึงร้านนี้', 403));
    }
    
    req.storeRole = storeUser.role; // เซ็ตบทบาทสำหรับใช้ใน controller
    next();
  } catch (error) {
    next(error);
  }
};

// ตรวจสอบสิทธิ์เฉพาะ admin ขึ้นไป
exports.isStoreAdmin = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;
    const userId = req.user.id;
    
    const storeUser = await StoreUser.findOne({ 
      store: storeId, 
      user: userId,
      role: { $in: ['owner', 'admin'] }
    });
    
    if (!storeUser) {
      return next(new ErrorResponse('ต้องการสิทธิ์ระดับ admin ขึ้นไป', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};