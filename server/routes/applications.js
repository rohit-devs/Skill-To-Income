const express = require('express');
const router = express.Router();
const { applyForTask, getTaskApplications, acceptApplicant } = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/apply', protect, applyForTask);
router.get('/task/:taskId', protect, getTaskApplications);
router.patch('/:id/accept', protect, acceptApplicant);

module.exports = router;
