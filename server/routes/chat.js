// ----------------------------------------------------------------------
// File: server/routes/chat.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: express, controllers, middleware.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { ensureTaskChatAccess } = require('../utils/chatAccess');

// GET /api/chat/:taskId — fetch message history
router.get('/:taskId', protect, async (req, res) => {
  try {
    const access = await ensureTaskChatAccess(req.params.taskId, req.user._id);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const messages = await Message.find({ taskId: req.params.taskId })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:taskId/unread — count unread for current user
router.get('/:taskId/unread', protect, async (req, res) => {
  try {
    const access = await ensureTaskChatAccess(req.params.taskId, req.user._id);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const count = await Message.countDocuments({
      taskId:   req.params.taskId,
      senderId: { $ne: req.user._id },
      read:     false,
    });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
