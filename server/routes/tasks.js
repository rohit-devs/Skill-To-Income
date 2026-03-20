const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/tasks - Get all open tasks (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { category, minBudget, maxBudget, status, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'open';
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    if (search) filter.title = { $regex: search, $options: 'i' };
    const tasks = await Task.find(filter)
      .populate('postedBy', 'name businessName city rating ratingCount role')
      .sort({ priority: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/my - Tasks posted by current business
router.get('/my', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ postedBy: req.user._id })
      .populate('assignedTo', 'name college skills rating')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/assigned - Tasks assigned to current student
router.get('/assigned', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('postedBy', 'name businessName city')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/review-queue - Tasks pending senior review
router.get('/review-queue', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student' || req.user.level !== 'senior') {
      return res.status(403).json({ message: 'Senior students only' });
    }
    const tasks = await Task.find({ status: 'submitted' })
      .populate('assignedTo', 'name college')
      .populate('postedBy', 'name businessName')
      .sort({ submittedAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('postedBy', 'name businessName city rating ratingCount role tasksCompleted')
      .populate('assignedTo', 'name college skills')
      .populate('reviewedBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks - Create task (business/company only)
router.post('/', protect, requireRole('business', 'company', 'admin'), async (req, res) => {
  try {
    const { title, description, category, budget, deadline,
            revisionsAllowed, referenceImage, priority } = req.body;
    const task = await Task.create({
      title, description, category, budget, deadline,
      revisionsAllowed: revisionsAllowed || 1,
      referenceImage: referenceImage || '',
      priority: priority || 'normal',
      postedBy: req.user._id
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/:id/accept - Student accepts a task
router.put('/:id/accept', protect, requireRole('student'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'open') return res.status(400).json({ message: 'Task is no longer available' });
    task.status = 'assigned';
    task.assignedTo = req.user._id;
    await task.save();
    res.json({ message: 'Task accepted successfully', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id/submit - Student submits work
router.put('/:id/submit', protect, requireRole('student'), async (req, res) => {
  try {
    const { submissionLink, submissionNote } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your task' });
    }
    if (task.status !== 'assigned') {
      return res.status(400).json({ message: 'Task cannot be submitted at this stage' });
    }
    task.status = 'submitted';
    task.submissionLink = submissionLink;
    task.submissionNote = submissionNote || '';
    task.submittedAt = new Date();
    await task.save();
    res.json({ message: 'Work submitted for senior review', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id/review - Senior student reviews
router.put('/:id/review', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student' || req.user.level !== 'senior') {
      return res.status(403).json({ message: 'Senior students only' });
    }
    const { decision, feedback } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'submitted') {
      return res.status(400).json({ message: 'Task not in submitted state' });
    }
    task.reviewedBy = req.user._id;
    task.reviewFeedback = feedback;
    task.reviewedAt = new Date();
    task.status = decision === 'approved' ? 'approved' : 'revision_requested';
    await task.save();
    res.json({ message: `Task ${decision}`, task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id/approve - Business approves and pays
router.put('/:id/approve', protect, requireRole('business', 'company'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your task' });
    }
    if (task.status !== 'approved') {
      return res.status(400).json({ message: 'Task must pass senior review before business approval' });
    }
    task.status = 'completed';
    task.isPaid = true;
    await task.save();
    // Update student earnings and task count
    await User.findByIdAndUpdate(task.assignedTo, {
      $inc: { tasksCompleted: 1, totalEarned: task.studentEarnings }
    });
    res.json({ message: 'Task approved and payment released', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
