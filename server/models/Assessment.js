// ----------------------------------------------------------------------
// File: server/models/Assessment.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: mongoose.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options:  [String],
  correct:  Number, // index of correct option
  points:   { type: Number, default: 1 },
});

const assessmentSchema = new mongoose.Schema({
  skill:       { type: String, required: true, unique: true },
  title:       String,
  description: String,
  duration:    { type: Number, default: 10 }, // minutes
  passMark:    { type: Number, default: 70 },  // percentage
  questions:   [questionSchema],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

const attemptSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  skill:        String,
  answers:      [Number],
  score:        Number,
  percentage:   Number,
  passed:       Boolean,
  timeTaken:    Number, // seconds
  attemptCount: { type: Number, default: 1 },
}, { timestamps: true });

attemptSchema.index({ userId: 1, skill: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
const Attempt    = mongoose.model('Attempt', attemptSchema);

module.exports = { Assessment, Attempt };
