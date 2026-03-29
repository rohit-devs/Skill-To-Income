import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return undefined;
    }

    socketRef.current = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: user.token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 20));
    });

    socket.on('task_update', (data) => {
      setNotifications(prev => [{
        type: 'task', message: data.message, taskId: data.taskId, timestamp: new Date(),
      }, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?.token]);

  const joinTask = useCallback((taskId) => socketRef.current?.emit('join_task', taskId), []);
  const leaveTask = useCallback((taskId) => socketRef.current?.emit('leave_task', taskId), []);
  const sendMessage = useCallback(
    (taskId, content, messageType = 'text') => socketRef.current?.emit('send_message', { taskId, content, messageType }),
    []
  );
  const sendTyping = useCallback((taskId, isTyping) => socketRef.current?.emit('typing', { taskId, isTyping }), []);
  const markRead = useCallback((taskId) => socketRef.current?.emit('mark_read', taskId), []);
  const clearNotification = useCallback((idx) => {
    setNotifications(prev => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      notifications,
      isConnected,
      joinTask,
      leaveTask,
      sendMessage,
      sendTyping,
      markRead,
      clearNotification,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
