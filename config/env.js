/**E:\learn-code\backend-pos\config\env.js */
require('dotenv').config();
const logger = require('../utils/logger'); 

// ตัวแปร environment ที่ต้องมีใน production
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET'
];

// ตรวจสอบตัวแปรที่จำเป็น
requiredEnvVars.forEach(env => {
  if (!process.env[env] && process.env.NODE_ENV === 'production') {
    logger.error(`❌ Missing required environment variable: ${env}`);
    process.exit(1);
  }
});

// ตรวจสอบค่า weak secrets ใน production
const checkWeakSecrets = () => {
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
};

// ค่า configuration
const config = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pos',
  MONGO_DEBUG: process.env.MONGO_DEBUG === 'true',
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  REDIS_TTL: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 ชั่วโมง
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 นาที
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 ครั้งต่อนาที
  
  // Email (ถ้ามี)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@yourdomain.com'
};

// ตรวจสอบ weak secrets ใน production
if (config.NODE_ENV === 'production') {
  checkWeakSecrets();
}

module.exports = config;
