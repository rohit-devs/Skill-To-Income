const express = require('express');
const router  = express.Router();
const Task    = require('../models/Task');
const User    = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/tasks — public task feed (NO auth required)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'open' };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const tasks = await Task.find(filter)
      .populate('postedBy', 'name businessName city rating ratingCount role')
      .sort({ priority: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tasks/my — role-aware: student=assigned, business=posted
router.get('/my', protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'student') {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('postedBy', 'name businessName city')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ postedBy: req.user._id })
        .populate('assignedTo', 'name college city rating')
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tasks/review — senior review queue
router.get('/review', protect, async (req, res) => {
  try {
    if (!req.user.isSenior && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Senior access required' });
    const tasks = await Task.find({ status: 'submitted' })
      .populate('postedBy',  'name businessName')
      .populate('assignedTo','name college city')
      .sort({ submittedAt: 1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('postedBy',  'name businessName city rating ratingCount role')
      .populate('assignedTo','name college city skills rating')
      .populate('reviewedBy','name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks — create
router.post('/', protect, requireRole('business','company','admin'), async (req, res) => {
  try {
    const { title, description, category, budget, deadline, revisions, priority } = req.body;
    if (!title || !description || !category || !budget || !deadline)
      return res.status(400).json({ message: 'Please fill all required fields' });
    const task = await Task.create({
      title, description, category,
      budget:    Number(budget),
      deadline:  String(deadline),
      revisions: Number(revisions) || 1,
      priority:  priority === true || priority === 'true' || false,
      postedBy:  req.user._id,
    });
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── PATCH /api/tasks/:id/accept ── student accepts open task
router.patch('/:id/accept', protect, requireRole('student'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'open')
      return res.status(400).json({ message: 'This task is no longer available' });
    if (String(task.assignedTo) === String(req.user._id))
      return res.status(400).json({ message: 'You already accepted this task' });
    task.status     = 'assigned';
    task.assignedTo = req.user._id;
    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { activeTasks: 1 } });
    res.json({ message: 'Task accepted! Get started and submit your work.', task });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/tasks/:id/submit ── student submits work
router.patch('/:id/submit', protect, requireRole('student'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.assignedTo) !== String(req.user._id))
      return res.status(403).json({ message: 'This is not your task' });
    if (task.status !== 'assigned' && task.status !== 'revision_requested')
      return res.status(400).json({ message: 'Task is not in a submittable state' });
    task.status        = 'submitted';
    task.submissionNote = req.body.note || '';
    task.submissionLink = req.body.link || '';
    task.submittedAt   = new Date();
    await task.save();
    res.json({ message: 'Work submitted! A senior student will review it shortly.', task });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/tasks/:id/review ── senior review
// FIX: Sets status to 'under_review' (not 'approved') so business can see approve button
router.patch('/:id/review', protect, async (req, res) => {
  try {
    if (!req.user.isSenior && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Senior students only' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'submitted')
      return res.status(400).json({ message: 'Task is not awaiting review' });
    const { action, note } = req.body;
    task.reviewedBy = req.user._id;
    task.reviewNote = note || '';
    task.reviewedAt = new Date();
    // CRITICAL FIX: approve → 'under_review' so business sees the approve button
    task.status = action === 'approve' ? 'under_review' : 'revision_requested';
    await task.save();
    res.json({
      message: action === 'approve'
        ? '✓ Approved — sent to client for final review'
        : 'Revision requested — student will be notified',
      task,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/tasks/:id/approve ── business final approval + payment
router.patch('/:id/approve', protect, requireRole('business','company'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id))
      return res.status(403).json({ message: 'This is not your task' });
    if (task.status !== 'under_review')
      return res.status(400).json({ message: 'Task must pass senior review first' });
    task.status = 'completed';
    task.isPaid = true;
    await task.save();
    if (task.assignedTo) {
      const pay = task.studentPay || Math.round(task.budget * 0.88);
      await User.findByIdAndUpdate(task.assignedTo._id, {
        $inc: { totalEarned: pay, tasksCompleted: 1, activeTasks: -1 },
      });
      // Auto-promote to senior after 10 tasks
      const student = await User.findById(task.assignedTo._id);
      if (student && student.tasksCompleted >= 10 && !student.isSenior) {
        await User.findByIdAndUpdate(student._id, { isSenior: true });
      }
    }
    res.json({ message: '🎉 Task completed! Payment released to student.', task });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    if (task.status !== 'open')
      return res.status(400).json({ message: 'Cannot delete an active task' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
