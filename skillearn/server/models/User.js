const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String },
  googleId:     { type: String },
  role:         { type: String, enum: ['student', 'business', 'company', 'admin'], default: 'student' },
  avatar:       { type: String, default: '' },

  // Student fields
  college:      String,
  city:         String,
  skills:       [String],
  verifiedSkills: [String],
  whatsapp:     String,
  upiId:        String,
  bio:          String,
  portfolio:    String,
  linkedinUrl:  String,
  githubUrl:    String,
  categoryStats: { type: Map, of: Number, default: {} },
  activeTasks:  { type: Number, default: 0 },
  streak:       { type: Number, default: 0 },
  lastActiveDate: Date,
  badges:       [{ name: String, awardedAt: Date, icon: String }],
  description:  { type: String, default: "" },

  // Business/Company fields
  businessName: String,
  businessType: String,
  website:      String,
  gstNumber:    String,
  subscriptionPlan:    { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
  subscriptionExpiry:  Date,

  // Stats
  totalEarned:    { type: Number, default: 0 },
  totalSpent:     { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  tasksPosted:    { type: Number, default: 0 },
  rating:         { type: Number, default: 0 },
  ratingCount:    { type: Number, default: 0 },
  isSenior:       { type: Boolean, default: false },
  isVerified:     { type: Boolean, default: false },
  isBanned:       { type: Boolean, default: false },
  banReason:      String,

  // Notification preferences
  emailNotifications: { type: Boolean, default: true },
  whatsappNotifications: { type: Boolean, default: true },

  // Password reset
  resetPasswordToken:   String,
  resetPasswordExpiry:  Date,
}, { timestamps: true, strict: false });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Update streak
userSchema.methods.updateStreak = function () {
  const today = new Date().toDateString();
  const last = this.lastActiveDate ? new Date(this.lastActiveDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === today) return;
  if (last === yesterday) this.streak = (this.streak || 0) + 1;
  else this.streak = 1;
  this.lastActiveDate = new Date();
};

module.exports = mongoose.model('User', userSchema);
