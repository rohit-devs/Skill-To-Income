const express = require('express');
const { body } = require('express-validator');

const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'business', 'company', 'admin']).withMessage('Invalid role'),
    validate,
  ],
  asyncHandler(registerUser)
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  asyncHandler(loginUser)
);

router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
