const express = require('express');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, asyncHandler(getDashboardStats));

module.exports = router;
