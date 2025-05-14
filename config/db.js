/**E:\learn-code\backend-pos\config\db.js */
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { MONGODB_URI } = require('../config/env');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000, // 5 วินาที
    socketTimeoutMS: 45000, // 45 วินาที
    maxPoolSize: 10, // Connection Pool
    retryWrites: true,
    w: 'majority'
  };

  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/BackendPoS', options);
      
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      setupEventListeners();
      
      return conn; // Return connection เมื่อเชื่อมต่อสำเร็จ
    } catch (err) {
      retries--;
      logger.error(`MongoDB connection failed (retries left: ${retries}): ${err.message}`);
      
      if (retries === 0) {
        logger.error('Could not connect to MongoDB after all retries');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // รอ 5 วินาทีก่อนลองใหม่
    }
  }
};

// แยกการตั้งค่า event listeners ออกมาเป็นฟังก์ชันเฉพาะ
function setupEventListeners() {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  // จัดการการปิด connection เมื่อ app ถูกปิด
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed due to app termination');
    process.exit(0);
  });
}

module.exports = connectDB;