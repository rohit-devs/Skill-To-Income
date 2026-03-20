const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

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
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      socket.taskId = taskId;
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { taskId, content, messageType = 'text' } = data;
        const message = await Message.create({
          taskId,
          senderId: socket.userId,
          content,
          messageType,
        });
        const populated = await message.populate('senderId', 'name role');

        // Broadcast to all in the task room
        io.to(`task_${taskId}`).emit('new_message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`task_${data.taskId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (taskId) => {
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
const notifyUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

module.exports = { initSocket, notifyUser };
