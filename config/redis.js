const redis = require('redis');

const {logger } = require('../utils/logger');

const client = redis.createClient({
   url: `redis://${process.env.REDIS_HOST || 'redis-container'}:6379`,
  password: process.env.REDIS_PASSWORD || ''
});

client.on('error', (err) => logger.error('Redis Client Error:', err));
client.on('connect', () => logger.info('Connected to Redis'));

(async () => {
  await client.connect();
})();

module.exports = client;