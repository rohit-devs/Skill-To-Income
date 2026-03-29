const express = require('express');
const router  = express.Router();
const Dispute = require('../models/Dispute');
const Task    = require('../models/Task');
const User    = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emails }    = require('../services/email');

// POST /api/disputes — open a dispute
router.post('/', protect, async (req, res) => {
  try {
    const { taskId, reason, description, evidence } = req.body;
    const task = await Task.findById(taskId)
      .populate('postedBy assignedTo');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const againstUser = String(task.postedBy._id) === String(req.user._id)
      ? task.assignedTo?._id
      : task.postedBy._id;

    const dispute = await Dispute.create({
      taskId, raisedBy: req.user._id, againstUser,
      reason, description, evidence: evidence || [],
      timeline: [{ action: 'Dispute opened', by: req.user._id, note: reason }],
    });

    await Task.findByIdAndUpdate(taskId, { status: 'disputed' });

    // Notify both parties
    const against = await User.findById(againstUser);
    if (against?.email) {
      const e = emails.disputeOpened(against.name, task.title, dispute._id);
      await sendEmail(against.email, e.subject, e.html);
    }

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/disputes/my — disputes involving current user
router.get('/my', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ raisedBy: req.user._id }, { againstUser: req.user._id }],
    })
      .populate('taskId', 'title budget')
      .populate('raisedBy', 'name role')
      .populate('againstUser', 'name role')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/disputes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('taskId')
      .populate('raisedBy', 'name role avatar')
      .populate('againstUser', 'name role avatar');
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/disputes/:id/resolve — admin resolves dispute
router.patch('/:id/resolve', protect, requireRole('admin'), async (req, res) => {
  try {
    const { resolution, status, adminNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    dispute.status = status; // 'resolved_student' | 'resolved_business'
    dispute.resolution = resolution;
    dispute.adminNotes = adminNotes;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    dispute.timeline.push({ action: `Resolved: ${status}`, by: req.user._id, note: resolution });
    await dispute.save();

    // Update task accordingly
    const finalStatus = status === 'resolved_student' ? 'completed' : 'cancelled';
    await Task.findByIdAndUpdate(dispute.taskId, { status: finalStatus });

    res.json({ message: 'Dispute resolved', dispute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
