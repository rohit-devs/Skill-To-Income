const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'skillearn_secret', { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, college, city, skills,
            whatsapp, businessName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({
      name, email, password,
      role: role || 'student',
      college, city,
      skills: skills || [],
      whatsapp,
      businessName,
    });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isSenior: user.isSenior,
      tasksCompleted: user.tasksCompleted, totalEarned: user.totalEarned,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    // Support both matchPassword and comparePassword method names
    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended. Contact support.' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isSenior: user.isSenior,
      city: user.city, skills: user.skills,
      college: user.college, businessName: user.businessName,
      tasksCompleted: user.tasksCompleted, totalEarned: user.totalEarned,
      verifiedSkills: user.verifiedSkills || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
