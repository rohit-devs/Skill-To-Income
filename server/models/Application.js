// ----------------------------------------------------------------------
// File: server/models/Application.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: mongoose.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Application', applicationSchema);
