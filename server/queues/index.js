const { Queue, QueueScheduler } = require('bullmq');

const redisOptions = {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

const emailQueueName = 'emailQueue';
const notificationQueueName = 'notificationQueue';

const emailQueue = new Queue(emailQueueName, redisOptions);
const notificationQueue = new Queue(notificationQueueName, redisOptions);

new QueueScheduler(emailQueueName, redisOptions);
new QueueScheduler(notificationQueueName, redisOptions);

module.exports = {
  emailQueue,
  notificationQueue,
};
