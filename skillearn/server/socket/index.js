const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { ensureTaskChatAccess } = require('../utils/chatAccess');

const emitChatError = (socket, message) => {
  socket.emit('chat_error', { message });
};

const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    // Join a task-specific chat room
    socket.on('join_task', async (taskId) => {
      if (!taskId) {
        emitChatError(socket, 'Task ID is required');
        return;
      }

      const access = await ensureTaskChatAccess(taskId, socket.userId);

      if (!access.ok) {
        emitChatError(socket, access.message);
        return;
      }

      socket.join(`task_${taskId}`);
      socket.taskId = taskId;
    });

    socket.on('leave_task', (taskId) => {
      if (!taskId) return;
      socket.leave(`task_${taskId}`);
      if (socket.taskId === taskId) {
        socket.taskId = null;
      }
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { taskId, content, messageType = 'text' } = data || {};
        const trimmedContent = String(content || '').trim();

        if (!taskId) {
          emitChatError(socket, 'Task ID is required');
          return;
        }

        if (!trimmedContent) {
          emitChatError(socket, 'Message cannot be empty');
          return;
        }

        const access = await ensureTaskChatAccess(taskId, socket.userId);

        if (!access.ok) {
          emitChatError(socket, access.message);
          return;
        }

        const message = await Message.create({
          taskId,
          senderId: socket.userId,
          content: trimmedContent,
          messageType,
        });
        const populated = await message.populate('senderId', 'name role avatar');

        // Broadcast to all in the task room
        io.to(`task_${taskId}`).emit('new_message', populated);
      } catch (err) {
        emitChatError(socket, 'Failed to send message');
      }
    });

    // Typing indicator
    socket.on('typing', async (data) => {
      const taskId = data?.taskId;

      if (!taskId) return;

      const access = await ensureTaskChatAccess(taskId, socket.userId);
      if (!access.ok) return;

      socket.to(`task_${taskId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: Boolean(data?.isTyping),
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (taskId) => {
      const access = await ensureTaskChatAccess(taskId, socket.userId);

      if (!access.ok) {
        return;
      }

      await Message.updateMany(
        { taskId, senderId: { $ne: socket.userId }, read: false },
        { read: true }
      );
      socket.to(`task_${taskId}`).emit('messages_read', { userId: socket.userId });
    });

    // Join notification room for this user
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Send notification to a specific user
/**
 * @function notifyUser
 * @description Reserved for future real-time features (e.g. push notifications, live status updates)
 */
const notifyUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

module.exports = { initSocket, notifyUser };
