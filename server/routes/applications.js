// ----------------------------------------------------------------------
// File: server/routes/applications.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: express, controllers, middleware.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const { applyForTask, getTaskApplications, acceptApplicant } = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/apply', protect, applyForTask);
router.get('/task/:taskId', protect, getTaskApplications);
router.patch('/:id/accept', protect, acceptApplicant);

module.exports = router;
