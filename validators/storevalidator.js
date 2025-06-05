//E:\learn-code\backend-pos\validators\storevalidator.js



const { body, param } = require('express-validator');
const Store = require('../models/store/store');
const StoreUser = require('../models/store/storeUser');
const User = require('../models/User');

exports.createStoreValidation = [
  body('name')
    .notEmpty().withMessage('ชื่อร้านค้าจำเป็นต้องกรอก')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('ชื่อร้านค้าต้องมีความยาวระหว่าง 3 ถึง 50 ตัวอักษร'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('คำอธิบายต้องไม่เกิน 500 ตัวอักษร'),
  
  body('address')
    .optional()
    .trim(),
  
  body('contact')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('ข้อมูลติดต่อต้องไม่เกิน 20 ตัวอักษร')
];

exports.addStoreUserValidation = [
  param('storeId')
    .notEmpty().withMessage('ต้องการรหัสร้านค้า')
    .isMongoId().withMessage('รหัสร้านค้าไม่ถูกต้อง')
    .custom(async (value, { req }) => {
      const store = await Store.findById(value);
      if (!store) {
        throw new Error('ไม่พบร้านค้า');
      }
      // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็นเจ้าของร้าน
      const isOwner = await StoreUser.findOne({
        store: value,
        user: req.user.id,
        role: 'owner'
      });
      if (!isOwner) {
        throw new Error('คุณไม่มีสิทธิ์เพิ่มผู้ใช้ในร้านนี้');
      }
      return true;
    }),
  
  body('userId')
    .notEmpty().withMessage('ต้องการรหัสผู้ใช้')
    .isMongoId().withMessage('รหัสผู้ใช้ไม่ถูกต้อง')
    .custom(async (value, { req }) => {
      const user = await User.findById(value);
      if (!user) {
        throw new Error('ไม่พบผู้ใช้');
      }
      // ตรวจสอบว่าผู้ใช้ยังไม่มีบทบาทในร้านนี้
      const existing = await StoreUser.findOne({
        store: req.params.storeId,
        user: value
      });
      if (existing) {
        throw new Error('ผู้ใช้นี้มีบทบาทในร้านนี้แล้ว');
      }
      return true;
    }),
  
  body('role')
    .notEmpty().withMessage('ต้องการบทบาท')
    .isIn(['admin', 'cashier']).withMessage('บทบาทต้องเป็น admin หรือ cashier')
];

exports.storeIdValidation = [
  param('storeId')
    .notEmpty().withMessage('ต้องการรหัสร้านค้า')
    .isMongoId().withMessage('รหัสร้านค้าไม่ถูกต้อง')
    .custom(async (value, { req }) => {
      // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงร้านนี้
      const storeUser = await StoreUser.findOne({
        store: value,
        user: req.user.id
      });
      if (!storeUser) {
        throw new Error('คุณไม่มีสิทธิ์เข้าถึงร้านนี้');
      }
      req.storeRole = storeUser.role; // เซ็ตบทบาทสำหรับใช้ใน controller
      return true;
    })
];

exports.updateStoreValidation = [
  ...exports.storeIdValidation,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('ชื่อร้านค้าต้องมีความยาวระหว่าง 3 ถึง 50 ตัวอักษร'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('คำอธิบายต้องไม่เกิน 500 ตัวอักษร')
];