// ----------------------------------------------------------------------
// File: server/middleware/error.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: express middleware, auth/validation helpers.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
