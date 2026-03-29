const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillearn_secret');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
  }

  return next();
};

const requireSenior = (req, res, next) => {
  if (!req.user?.isSenior && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only senior students can perform this action' });
  }

  return next();
};

module.exports = { protect, requireRole, requireSenior };
