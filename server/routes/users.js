// ----------------------------------------------------------------------
// File: server/routes/users.js
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
const {
  getProfile,
  updateProfile,
  getEarnings,
  getLeaderboard,
  getPublicProfile,
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, asyncHandler(getProfile));

router.put('/profile', protect, asyncHandler(updateProfile));

router.get('/earnings', protect, asyncHandler(getEarnings));

router.get('/leaderboard', asyncHandler(getLeaderboard));

router.get('/:id', asyncHandler(getPublicProfile));

module.exports = router;
