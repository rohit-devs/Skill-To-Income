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
