//E:\learn-code\backend-pos\services\cacheService.js
// 
// 
const redis = require('redis');
const logger = require('../utils/logger');

const {REDIS_PORT,REDIS_PASSWORD,REDIS_HOST} =require('../config/env');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      socket: {
        host: REDIS_HOST || 'localhost',
        port: parseInt(REDIS_PORT) || 6379,
      },
      password: REDIS_PASSWORD || undefined, // ✅ เพิ่มตรงนี้
    });

    this.client.on('error', (err) => {
      logger.error('🔴 Redis error:', err); // ✅ log ทั้ง object เพื่อเห็นรายละเอียด
    });

    this.client.on('connect', () => {
      logger.info('✅ Connected to Redis');
    });

    this.client.connect(); // สำคัญสำหรับ Redis v4+
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      logger.error(`Cache get error: ${err.message}`);
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.client.set(key, value);
    } catch (err) {
      logger.error(`Cache set error: ${err.message}`);
    }
  }

  async setex(key, ttl, value) {
    try {
      await this.client.setEx(key, ttl, value); // Note: v4+ uses setEx, not setex
    } catch (err) {
      logger.error(`Cache setex error: ${err.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error(`Cache del error: ${err.message}`);
    }
  }
}

module.exports = new CacheService();
