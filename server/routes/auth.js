const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'skillearn_secret', { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, college, city, skills, whatsapp,
            yearOfStudy, businessName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({
      name, email, password, role: role || 'student',
      college, city, skills: skills || [], whatsapp, yearOfStudy, businessName
    });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, level: user.level,
      token: generateToken(user._id)
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
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, level: user.level, city: user.city,
      skills: user.skills, college: user.college,
      tasksCompleted: user.tasksCompleted, totalEarned: user.totalEarned,
      token: generateToken(user._id)
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

const passport = require('passport');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const { token, user } = req.user;
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=${user.role}&name=${encodeURIComponent(user.name)}`);
  }
);
