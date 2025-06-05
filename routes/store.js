
//E:\learn-code\backend-pos\routes\store.js


const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const storeValidator = require('../validators/storeValidator');
const storeMiddleware = require('../middleware/storeMiddleware');
const {requireAuth} = require('../middleware/auth')



router
.route('/')
.post( requireAuth,storeValidator.createStoreValidation,storeController.createStore)// สร้างร้านค้าใหม่
.get(requireAuth,storeController.getAllStores)// ดูร้านค้าของฉันทั้งหมด

//ดูข้อมูลร้านค้าตัวเอง
router.get(
  '/my-stores',
  requireAuth,
  storeController.getMyStores
);



// ดูข้อมูลร้านค้า
router.get(
  '/:storeId',
  requireAuth,
  storeValidator.storeIdValidation,
  storeMiddleware.hasStoreAccess,
  storeController.getStore
);

// อัปเดตร้านค้า
router.put(
  '/:storeId',
  requireAuth,
  storeValidator.storeIdValidation,
  storeValidator.updateStoreValidation,
  storeMiddleware.isStoreOwner,
  storeController.updateStore
);

// ลบร้านค้า
router.delete(
  '/:storeId',
  requireAuth,
  storeValidator.storeIdValidation,
  storeMiddleware.isStoreOwner,
  storeController.deleteStore
);

// เพิ่มผู้ใช้ในร้านค้า
router.post(
  '/:storeId/users',
  requireAuth,
  storeValidator.storeIdValidation,
  storeValidator.addStoreUserValidation,
  storeMiddleware.isStoreOwner,
  storeController.addStoreUser
);

// ดูผู้ใช้ทั้งหมดในร้านค้า
router.get(
  '/:storeId/users',
  requireAuth,
  storeValidator.storeIdValidation,
  storeMiddleware.hasStoreAccess,
  storeController.getStoreUsers
);

// เปลี่ยนบทบาทผู้ใช้ในร้าน
router.put(
  '/:storeId/users/:userId/role',
  requireAuth,
  storeValidator.storeIdValidation,
  storeMiddleware.isStoreOwner,
  storeController.changeUserRole
);

// ลบผู้ใช้ออกจากร้าน
router.delete(
  '/:storeId/users/:userId',
  requireAuth,
  storeValidator.storeIdValidation,
  storeMiddleware.isStoreOwner,
  storeController.removeStoreUser
);

module.exports = router;