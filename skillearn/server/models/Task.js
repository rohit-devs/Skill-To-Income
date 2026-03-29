const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String, required: true,
    enum: ['Design','Writing','Data','Social Media','Video','Research','Coding','Marketing','Other'],
  },
  budget:   { type: Number, required: true, min: 50 },
  deadline: { type: String, required: true },        // "24 hrs" string
  revisions: { type: Number, default: 1 },
  referenceImage: { type: String, default: '' },
  hasAITest: { type: Boolean, default: false },
  taskDetails: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open','assigned','submitted','under_review','approved',
           'revision_requested','completed','cancelled','disputed'],
    default: 'open',
  },
  priority:     { type: Boolean, default: false },   // Boolean not enum
  paymentStatus:{ type: String, default: 'unpaid' },
  // Relations
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Submission
  submissionLink: { type: String, default: '' },
  submissionNote: { type: String, default: '' },
  submittedAt:    { type: Date, default: null },
  // Review
  reviewNote:  { type: String, default: '' },
  reviewedAt:  { type: Date, default: null },
  // Financial
  commission:  { type: Number, default: 0.12 },
  studentPay:  { type: Number, default: 0 },
  isPaid:      { type: Boolean, default: false },
  // Applicants
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true, strict: false });

// Calculate studentPay before saving
taskSchema.pre('save', function (next) {
  this.studentPay = Math.round(this.budget * (1 - this.commission));
  next();
});

taskSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.price = ret.budget;
    ret.skill = ret.category;
    return ret;
  },
});

taskSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.price = ret.budget;
    ret.skill = ret.category;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
