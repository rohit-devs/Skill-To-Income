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
