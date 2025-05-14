const { createClient } = require('redis');
const logger = require('../utils/logger');
const {REDIS_PASSWORD,REDIS_HOST,REDIS_PORT} = require('../config/env');

// 1. สร้าง Redis Client ด้วยการตั้งค่าจาก config

const usePassword = REDIS_PASSWORD && REDIS_PASSWORD.trim() !== "";
const redisClient = createClient({
  url: usePassword
    ? `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
    : `redis://${REDIS_HOST}:${REDIS_PORT}`,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        logger.error('Redis connection retries exhausted');
        return new Error('Retry attempts exhausted');
      }
      return Math.min(retries * 200, 1000);
    }
  }
});

// 2. ตั้งค่า Event Listeners
redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redisClient.on('ready', () => {
  logger.info('🚀 Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error(`❌ Redis error: ${err.message}`);
});

redisClient.on('end', () => {
  logger.warn('🔌 Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

// 3. ฟังก์ชันเชื่อมต่อ Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    logger.info('🛠️ Redis client connected successfully');
    return redisClient;
  } catch (err) {
    logger.error(`🚨 Failed to connect to Redis: ${err.message}`);
    process.exit(1);
  }
};

// 4. ฟังก์ชันตรวจสอบสถานะ
const checkRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    const ping = await redisClient.ping();
    return ping === 'PONG';
  } catch (err) {
    logger.error(`Redis health check failed: ${err.message}`);
    return false;
  }
};

// 5. ฟังก์ชันปิดการเชื่อมต่อ (สำหรับ graceful shutdown)
const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('🛑 Redis connection closed gracefully');
    }
  } catch (err) {
    logger.error(`Error closing Redis connection: ${err.message}`);
  }
};

// 6. Graceful shutdown handler
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

module.exports = {
  redisClient,
  connectRedis,
  checkRedis,
  disconnectRedis
};