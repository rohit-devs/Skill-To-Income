const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/chat/:taskId — fetch message history
router.get('/:taskId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ taskId: req.params.taskId })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:taskId/unread — count unread for current user
router.get('/:taskId/unread', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      taskId:   req.params.taskId,
      senderId: { $ne: req.user._id },
      read:     false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
