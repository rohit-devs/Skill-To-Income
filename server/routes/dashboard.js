// ----------------------------------------------------------------------
// File: server/routes/dashboard.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: express, controllers, middleware.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const express = require('express');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, asyncHandler(getDashboardStats));

module.exports = router;
