const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq'], default: 'mcq' },
  options: { type: [String], default: [] },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  correctHint: { type: String },
  points: { type: Number, default: 20 },
});

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  mcqChoice: Number,
  timeTaken: Number,
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [answerSchema], default: [] },
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  submittedAt: Date,
  timeTakenTotal: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending_student', 'submitted', 'passed', 'failed'],
    default: 'pending_student',
  },
}, { _id: false });

const taskTestSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, unique: true },
  generatedBy: { type: String, default: 'claude-sonnet-4-20250514' },
  passThreshold: { type: Number, default: 70 },
  testTitle: String,
  testIntro: String,
  questions: [questionSchema],
  attempts: { type: [attemptSchema], default: [] },
  status: {
    type: String,
    enum: ['pending_student', 'passed', 'failed'],
    default: 'pending_student',
  },
}, { timestamps: true });

module.exports = mongoose.model('TaskTest', taskTestSchema);
