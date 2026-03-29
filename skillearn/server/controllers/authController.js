const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillearn_secret', {
    expiresIn: '30d',
  });
};

const serializeAuthUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  city: user.city || '',
  college: user.college || '',
  skills: user.skills || [],
  businessName: user.businessName || '',
  isSenior: Boolean(user.isSenior),
  isVerified: Boolean(user.isVerified),
  isBanned: Boolean(user.isBanned),
  tasksCompleted: user.tasksCompleted || 0,
  tasksPosted: user.tasksPosted || 0,
  totalEarned: user.totalEarned || 0,
  totalSpent: user.totalSpent || 0,
  rating: user.rating || 0,
  ratingCount: user.ratingCount || 0,
  verifiedSkills: user.verifiedSkills || [],
  ...(token ? { token } : {}),
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    college,
    city,
    skills,
    whatsapp,
    businessName,
  } = req.body;

  const normalizedEmail = email.toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });

  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'student',
    college,
    city,
    skills: Array.isArray(skills) ? skills : [],
    whatsapp,
    businessName,
  });

  const token = generateToken(user._id);
  res.status(201).json(serializeAuthUser(user, token));
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = user.matchPassword
    ? await user.matchPassword(password)
    : await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBanned) {
    return res.status(403).json({ message: 'Account suspended. Contact support.' });
  }

  const token = generateToken(user._id);
  res.json(serializeAuthUser(user, token));
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;

  res.json(serializeAuthUser(req.user, token));
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
