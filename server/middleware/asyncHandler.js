// ----------------------------------------------------------------------
// File: server/middleware/asyncHandler.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: express middleware, auth/validation helpers.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
