/**E:\learn-code\backend-pos\config\env.js */
require('dotenv').config();
const logger = require('../utills/logger'); 

module.exports = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pos',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_weak_secret_please_change',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'default_weak_refresh_secret',
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production'
};

// ตรวจสอบค่าใน production
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = [
    'default_weak_secret_please_change',
    'default_weak_refresh_secret'
  ];
  
  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    logger.error('❌ Weak JWT secret in production!');
    process.exit(1);
  }
  
  if (weakSecrets.includes(process.env.REFRESH_TOKEN_SECRET)) {
    logger.error('❌ Weak refresh token secret in production!');
    process.exit(1);
  }
}