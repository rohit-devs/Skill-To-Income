const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  taskId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  raisedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason:      { type: String, required: true },
  description: { type: String, required: true },
  evidence:    [{ type: String }], // Cloudinary URLs
  status:      { type: String, enum: ['open', 'under_review', 'resolved_student', 'resolved_business', 'closed'], default: 'open' },
  resolution:  { type: String },
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:  { type: Date },
  adminNotes:  { type: String },
  timeline: [{
    action:    String,
    by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
