//E:\learn-code\backend-pos\config\redis.js
const redis = require('redis');
const logger  = require('../utils/logger');
const {REDIS_HOST,REDIS_PASSWORD,REDIS_PORT } = require('../config/env')

const redisClient = redis.createClient({
  url:`redis://${REDIS_HOST|| 'localhost'}:${REDIS_PORT || 6379}`,
  socket:{
    reconnectStrategy:(retries)=>{
      if(retries > 5){
        logger.error('ttoo many retries on Redis. connection error')
        return new Error('to many retries')
      }
      return Math.min(retries * 100, 5000)
    }
    
  }
});


redisClient.on('error',(err)=>{
  logger.error(`redis Error:${err.message}`)
})

redisClient.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (err) {
    logger.error(`Redis connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  connectRedis
}