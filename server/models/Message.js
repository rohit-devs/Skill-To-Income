// ----------------------------------------------------------------------
// File: server/models/Message.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: mongoose.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  taskId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:     { type: String, required: true },
  messageType: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  fileUrl:     { type: String },
  fileName:    { type: String },
  read:        { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
