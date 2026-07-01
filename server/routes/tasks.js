const express = require('express');
const { body, query } = require('express-validator');

const { protect, requireRole, requireSenior } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const {
  getTasks,
  getMyTasks,
  getTasksForReview,
  getTaskById,
  createTask,
  acceptTask,
  submitTaskForReview,
  reviewTask,
  clientApproveTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get(
  '/',
  [
    query('category').optional().isString(),
    query('search').optional().isString(),
    validate,
  ],
  asyncHandler(getTasks)
);

router.get('/my', protect, asyncHandler(getMyTasks));

router.get('/review', protect, requireSenior, asyncHandler(getTasksForReview));

router.get('/:id', asyncHandler(getTaskById));

router.post(
  '/',
  protect,
  requireRole('business', 'company', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').optional().trim().notEmpty().withMessage('Category is required'),
    body('skill').optional().trim().notEmpty().withMessage('Skill is required'),
    body('budget').optional().isNumeric().withMessage('Budget must be a number'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('deadline').trim().notEmpty().withMessage('Deadline is required'),
    body('revisions')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Revisions must be a non-negative integer'),
    validate,
  ],
  asyncHandler(createTask)
);

router.patch('/:id/accept', protect, requireRole('student'), asyncHandler(acceptTask));

router.patch(
  '/:id/submit',
  protect,
  requireRole('student'),
  [
    body('link')
      .optional()
      .isURL({ require_protocol: true })
      .withMessage('Submission link must be a valid URL'),
    body('note').optional().isString(),
    validate,
  ],
  asyncHandler(submitTaskForReview)
);

router.patch(
  '/:id/review',
  protect,
  requireSenior,
  [
    body('action').isIn(['approve', 'revision']).withMessage('Action must be approve or revision'),
    body('note').optional().isString(),
    validate,
  ],
  asyncHandler(reviewTask)
);

router.patch(
  '/:id/approve',
  protect,
  requireRole('business', 'company'),
  asyncHandler(clientApproveTask)
);

router.patch(
  '/:id/status',
  protect,
  [
    body('status').trim().notEmpty().withMessage('Status is required'),
    validate,
  ],
  asyncHandler(updateTaskStatus)
);

router.put('/:id', protect, asyncHandler(updateTask));

router.delete('/:id', protect, asyncHandler(deleteTask));

module.exports = router;
