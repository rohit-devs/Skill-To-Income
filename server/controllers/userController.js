const User = require('../models/User');
const Task = require('../models/Task');

/**
 * @desc    Get user profile (self)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  console.log('Update Profile Request:', req.body);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-password');

  res.json(user);
};

/**
 * @desc    Get user earnings and weekly breakdown
 * @route   GET /api/users/earnings
 * @access  Private
 */
const getEarnings = async (req, res) => {
  const completedTasks = await Task.find({
    assignedTo: req.user._id,
    status: 'completed',
  })
    .populate('postedBy', 'name businessName')
    .sort({ updatedAt: -1 });

  const totalEarned = completedTasks.reduce((s, t) => s + (t.studentPay || 0), 0);

  const now = new Date();
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const amount = completedTasks
      .filter((t) => new Date(t.updatedAt).toDateString() === d.toDateString())
      .reduce((s, t) => s + (t.studentPay || 0), 0);
    return { label, amount };
  });

  res.json({ totalEarned, completedTasks, weekly });
};

/**
 * @desc    Get student leaderboard
 * @route   GET /api/users/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res) => {
  const leaders = await User.find({ role: 'student', tasksCompleted: { $gt: 0 } })
    .select('name college city totalEarned tasksCompleted rating isSenior skills verifiedSkills')
    .sort({ totalEarned: -1 })
    .limit(10);
  res.json(leaders);
};

/**
 * @desc    Get public user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -email -whatsapp -upiId'
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const recentTasks = await Task.find({
    assignedTo: req.params.id,
    status: 'completed',
  })
    .select('title category budget studentPay updatedAt')
    .limit(5);

  res.json({ user, recentTasks });
};

module.exports = {
  getProfile,
  updateProfile,
  getEarnings,
  getLeaderboard,
  getPublicProfile,
};
