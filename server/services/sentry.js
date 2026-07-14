const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const logger = require('../logger');

const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('Sentry DSN not configured, skipping Sentry initialization');
    return false;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    integrations: [new Tracing.Integrations.Http({ tracing: true })],
  });
  logger.info('Sentry initialized');
  return true;
};

module.exports = { Sentry, initSentry };
