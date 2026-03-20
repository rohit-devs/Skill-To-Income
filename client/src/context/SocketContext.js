import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?.token) return;

    socketRef.current = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: user.token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));

    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 20));
    });

    socket.on('task_update', (data) => {
      setNotifications(prev => [{
        type: 'task', message: data.message, taskId: data.taskId, timestamp: new Date(),
      }, ...prev].slice(0, 20));
    });

    return () => socket.disconnect();
  }, [user?.token]);

  const joinTask = (taskId) => socketRef.current?.emit('join_task', taskId);
  const sendMessage = (taskId, content) => socketRef.current?.emit('send_message', { taskId, content });
  const sendTyping = (taskId, isTyping) => socketRef.current?.emit('typing', { taskId, isTyping });
  const markRead = (taskId) => socketRef.current?.emit('mark_read', taskId);
  const clearNotification = (idx) => setNotifications(prev => prev.filter((_, i) => i !== idx));

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, notifications, onlineUsers,
      joinTask, sendMessage, sendTyping, markRead, clearNotification,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
