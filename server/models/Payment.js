// ----------------------------------------------------------------------
// File: server/models/Payment.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: mongoose.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  taskId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  businessId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount:       { type: Number, required: true },
  commission:   { type: Number, required: true },
  studentPay:   { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  status:       { type: String, enum: ['pending', 'in_escrow', 'released', 'refunded', 'failed'], default: 'pending' },
  // Razorpay fields
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  payoutId:          String,
  // Timestamps
  paidAt:     Date,
  releasedAt: Date,
  refundedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
