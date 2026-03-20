const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Design', 'Writing', 'Data', 'Social Media', 'Video', 'Research', 'Coding', 'Marketing', 'Other']
  },
  budget: { type: Number, required: true, min: 50 },
  deadline: { type: String, required: true }, // hours
  revisionsAllowed: { type: Number, default: 1 },
  referenceImage: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'assigned', 'submitted', 'under_review', 'approved', 'revision_requested', 'completed', 'cancelled'],
    default: 'open'
  },
  priority: { type: String, enum: ['normal', 'featured', 'urgent'], default: 'normal' },
  // Relations
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Submission
  submissionLink: { type: String, default: '' },
  submissionNote: { type: String, default: '' },
  submittedAt: { type: Date, default: null },
  // Review
  reviewFeedback: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
  // Payment
  platformFee: { type: Number, default: 0.12 },
  studentEarnings: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  // Applicants
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Calculate student earnings before saving
taskSchema.pre('save', function (next) {
  this.studentEarnings = Math.round(this.budget * (1 - this.platformFee));
  next();
});

// Virtual for platform commission
taskSchema.virtual('commission').get(function () {
  return Math.round(this.budget * this.platformFee);
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
