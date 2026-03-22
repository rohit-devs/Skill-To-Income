const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Task    = require('../models/Task');
const { protect } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name','college','city','skills','whatsapp','businessName',
                     'bio','upiId','linkedinUrl','githubUrl','emailNotifications'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/earnings
router.get('/earnings', protect, async (req, res) => {
  try {
    const completedTasks = await Task.find({
      assignedTo: req.user._id, status: 'completed',
    }).populate('postedBy', 'name businessName').sort({ updatedAt: -1 });

    const totalEarned = completedTasks.reduce((s, t) => s + (t.studentPay || 0), 0);

    const now = new Date();
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const amount = completedTasks
        .filter(t => new Date(t.updatedAt).toDateString() === d.toDateString())
        .reduce((s, t) => s + (t.studentPay || 0), 0);
      return { label, amount };
    });

    res.json({ totalEarned, completedTasks, weekly });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await User.find({ role: 'student', tasksCompleted: { $gt: 0 } })
      .select('name college city totalEarned tasksCompleted rating isSenior skills verifiedSkills')
      .sort({ totalEarned: -1 })
      .limit(10);
    res.json(leaders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -whatsapp -upiId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const recentTasks = await Task.find({ assignedTo: req.params.id, status: 'completed' })
      .select('title category budget studentPay updatedAt').limit(5);
    res.json({ user, recentTasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
