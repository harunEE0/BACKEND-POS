//E:\learn-code\backend-pos\services\cacheService.js
// 
// 
const {redisClient}  =require('../config/redis');
const logger = require('../utils/logger');



const catchService = {
  get: async (key)=>{
    try {
      const data = await redisClient.get(key);
      return data;
    } catch (error) {
      logger.error(`Error getting cache for key ${key}: ${error.message}`);
      throw error;
      
    }
  },

  setex: async (key, ttl ,value)=>{
    try {
      await redisClient.setEx(key, ttl, value);
    } catch (error) {
      logger.error(`Error setting cache for key ${key}: ${error.message}`);
      throw error;
      
    }
  },
  del: async (key)=>{
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}: ${error.message}`);
      throw error;
      
    }
  },

  flushDashboardCatche : async(key)=>{
    try {
      redisClient.del('dashboard_stats')
      redisClient.del('dashboard_stats:products')
      redisClient.del('dashboard_stats:todayOrders')
      logger.info('Dashboard cache flush');
    } catch (error) {
      logger.error(`Error flushing dashboard cache: ${error.message}`);
      throw error;
      
    }
  },

}

module.exports = catchService;