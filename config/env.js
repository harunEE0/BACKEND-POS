/**backend-pos/config/env.js */

require('dotenv').config();

// ตรวจสอบตัวแปรที่จำเป็น
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(env => {
  if (!process.env[env] && env !== 'JWT_SECRET') {
    console.error(`❌ Error: Missing required environment variable "${env}"`);
    process.exit(1);
  }
});

module.exports = {
  // พอร์ตเซิร์ฟเวอร์
  PORT: process.env.PORT || 5000,
  
  // การเชื่อมต่อ MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pos',
  
  // การตั้งค่า JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_weak_secret_please_change',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  
  // การตั้งค่าเพิ่มเติมสำหรับ production
  NODE_ENV: process.env.NODE_ENV || 'development',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  
  // การตั้งค่า Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};