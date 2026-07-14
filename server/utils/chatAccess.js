// ----------------------------------------------------------------------
// File: server/utils/chatAccess.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: project runtime dependencies.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

const Task = require('../models/Task');

const ACTIVE_CHAT_STATUSES = [
  'assigned',
  'submitted',
  'under_review',
  'revision_requested',
  'completed',
];

const ensureTaskChatAccess = async (taskId, userId) => {
  const task = await Task.findById(taskId).select('status postedBy assignedTo');

  if (!task) {
    return { ok: false, status: 404, message: 'Task not found' };
  }

  if (!ACTIVE_CHAT_STATUSES.includes(task.status) || !task.assignedTo) {
    return { ok: false, status: 403, message: 'Chat is available only for assigned tasks' };
  }

  const isOwner = String(task.postedBy) === String(userId);
  const isAssignedUser = String(task.assignedTo) === String(userId);

  if (!isOwner && !isAssignedUser) {
    return { ok: false, status: 403, message: 'You are not allowed to access this chat' };
  }

  return { ok: true, task };
};

module.exports = { ensureTaskChatAccess, ACTIVE_CHAT_STATUSES };
