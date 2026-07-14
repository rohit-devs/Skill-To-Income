const { Worker } = require('bullmq');
const logger = require('./logger');
const { sendEmail } = require('./services/email');

const redisOptions = {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'Processing email job');
    if (job.name === 'sendEmail') {
      const { to, subject, html } = job.data;
      await sendEmail(to, subject, html);
      logger.info({ to }, 'Email job completed');
    }
  },
  redisOptions
);

const notificationWorker = new Worker(
  'notificationQueue',
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'Processing notification job');
    if (job.name === 'sendNotification') {
      const { userId, payload } = job.data;
      // TODO: implement real notification delivery logic
      logger.info({ userId, payload }, 'Notification job processed');
    }
  },
  redisOptions
);

emailWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'Email worker completed job'));
emailWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Email worker failed'));
notificationWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'Notification worker completed job'));
notificationWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Notification worker failed'));

process.on('SIGINT', async () => {
  logger.info('Shutting down workers...');
  await Promise.all([emailWorker.close(), notificationWorker.close()]);
  process.exit(0);
});

logger.info('Worker process started');
