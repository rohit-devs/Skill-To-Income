// ----------------------------------------------------------------------
// File: server/logger.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: project runtime dependencies.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { pid: false },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
