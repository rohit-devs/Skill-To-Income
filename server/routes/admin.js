const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Task    = require('../models/Task');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const { protect, requireRole } = require('../middleware/auth');

const adminOnly = [protect, requireRole('admin')];

// GET /api/admin/stats — platform-wide analytics
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [
      totalUsers, totalStudents, totalBusinesses,
      totalTasks, openTasks, completedTasks,
      totalPayments, openDisputes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['business', 'company'] } }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'open' }),
      Task.countDocuments({ status: 'completed' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, commission: { $sum: '$commission' } } }]),
      Dispute.countDocuments({ status: 'open' }),
    ]);

    const revenue = totalPayments[0] || { total: 0, commission: 0 };

    // Monthly task trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTasks = await Task.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category distribution
    const categoryStats = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      users: { total: totalUsers, students: totalStudents, businesses: totalBusinesses },
      tasks: { total: totalTasks, open: openTasks, completed: completedTasks },
      revenue: { total: revenue.total, commission: revenue.commission },
      disputes: { open: openDisputes },
      monthlyTasks,
      categoryStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — list all users with filters
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/ban — ban/unban user
router.patch('/users/:id/ban', ...adminOnly, async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { isBanned, banReason: isBanned ? banReason : '' }, { new: true }
    ).select('-password');
    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/verify — verify user
router.patch('/users/:id/verify', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isVerified: true }, { new: true }
    ).select('-password');
    res.json({ message: 'User verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/tasks — all tasks with filters
router.get('/tasks', ...adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const tasks = await Task.find(filter)
      .populate('postedBy', 'name businessName')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/tasks/:id — force delete any task
router.delete('/tasks/:id', ...adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/disputes — all open disputes
router.get('/disputes', ...adminOnly, async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('taskId', 'title budget')
      .populate('raisedBy', 'name role')
      .populate('againstUser', 'name role')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/revenue — revenue breakdown
router.get('/revenue', ...adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find({ status: { $in: ['in_escrow', 'released'] } })
      .populate('taskId', 'title category')
      .populate('businessId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(50);
    const summary = await Payment.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
    ]);
    res.json({ payments, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
