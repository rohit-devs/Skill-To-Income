const Redis = require('ioredis');
const logger = require('../logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisClient.on('connect', () => logger.info({ redisUrl }, 'Redis connected'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis connection error'));

module.exports = redisClient;
