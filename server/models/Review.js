const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true },
  checklist: {
    matchesBrief: { type: Boolean, default: false },
    correctFormat: { type: Boolean, default: false },
    noErrors: { type: Boolean, default: false },
    withinRevisions: { type: Boolean, default: false }
  },
  decision: { type: String, enum: ['approved', 'revision_requested'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
