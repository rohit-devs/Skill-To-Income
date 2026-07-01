import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ChatWindow = ({ taskId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // Load history
    api.get(`/chat/${taskId}`).then(({ data }) => {
      setMessages(data);
      setLoading(false);
    });

    // Connect socket
    const { io } = require('socket.io-client');
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: user?.token },
    });
    socketRef.current = socket;
    socket.emit('join_task', taskId);

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('user_typing', ({ isTyping }) => setIsTyping(isTyping));

    return () => socket.disconnect();
  }, [taskId, user?.token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    socketRef.current?.emit('send_message', { taskId, content: input.trim() });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { taskId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('typing', { taskId, isTyping: false });
    }, 1500);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const isMine = (msg) => String(msg.senderId?._id || msg.senderId) === String(user?._id);

  if (loading) {
    return (
      <div className="border border-outline-v/40 rounded-3xl overflow-hidden bg-s-low mt-5 shadow-inner">
        <div className="h-14 bg-s-mid/50 border-b border-outline-v/30 flex items-center px-5">
           <div className="w-28 h-4 bg-outline-v/50 rounded-md animate-shimmer bg-[length:200%_100%]" />
        </div>
        <div className="p-5 flex flex-col gap-6">
           <div className="flex gap-3 items-end">
             <div className="w-8 h-8 rounded-full bg-outline-v/40 animate-shimmer bg-[length:200%_100%] shrink-0" />
             <div className="w-56 h-12 rounded-2xl rounded-bl-sm bg-outline-v/20 animate-shimmer bg-[length:200%_100%]" />
           </div>
           <div className="flex gap-3 justify-end items-end">
             <div className="w-48 h-12 rounded-2xl rounded-br-sm bg-primary/20 animate-shimmer bg-[length:200%_100%]" />
           </div>
           <div className="flex gap-3 items-end">
             <div className="w-8 h-8 rounded-full bg-outline-v/40 animate-shimmer bg-[length:200%_100%] shrink-0" />
             <div className="w-32 h-10 rounded-2xl rounded-bl-sm bg-outline-v/20 animate-shimmer bg-[length:200%_100%]" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-outline-v/30 rounded-3xl overflow-hidden bg-s-low mt-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col relative z-10 transition-all duration-300">
      {/* Header */}
      <div className="h-14 px-5 border-b border-outline-v/30 bg-surface/80 backdrop-blur-md flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] icon-fill">forum</span>
          <span className="font-extrabold text-[15px] text-on-surface tracking-tight">Task Chat</span>
        </div>
        <span className="text-[11px] font-bold text-on-sv uppercase tracking-widest bg-s-mid px-2.5 py-1 rounded-md">Confidential</span>
      </div>

      {/* Messages Area */}
      <div className="h-[360px] overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5 bg-[#090B14]">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-on-sv opacity-70">
            <span className="material-symbols-outlined text-[48px] mb-3 icon-fill opacity-20">waving_hand</span>
            <span className="text-[14px] font-semibold">No messages yet. Say hello!</span>
          </div>
        )}
        
        {messages.map((msg, i) => {
          const mine = isMine(msg);
          const showAvatar = !mine && (i === 0 || messages[i-1].senderId?._id !== msg.senderId?._id);

          return (
            <div key={i} className={`flex items-end gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0 bg-s-highest shadow-sm ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                   {(msg.senderId?.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="max-w-[75%] flex flex-col">
                {!mine && showAvatar && <span className="text-[10px] font-bold text-on-sv ml-1 mb-1">{msg.senderId?.name}</span>}
                <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm filter drop-shadow-sm ${
                  mine 
                    ? 'bg-gradient-to-tr from-primary to-accent-violet text-white rounded-2xl rounded-br-[4px]' 
                    : 'bg-s-mid text-on-surface rounded-2xl rounded-bl-[4px] border border-outline-v/30'
                }`}>
                  {msg.content}
                </div>
                <div className={`text-[9.5px] font-semibold text-on-sv/60 mt-1.5 ${mine ? 'text-right mr-1' : 'text-left ml-1'}`}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 justify-start animate-[fadeIn_0.3s]">
            <div className="w-8 h-8 rounded-full bg-s-highest flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-[14px] text-on-sv">more_horiz</span>
            </div>
            <div className="bg-s-mid px-4 py-3 rounded-2xl rounded-bl-[4px] border border-outline-v/30 flex gap-1 items-center h-10 shadow-sm">
              <div className="w-1.5 h-1.5 bg-on-sv/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-on-sv/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-on-sv/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input row */}
      <div className="p-4 bg-surface/90 backdrop-blur-md border-t border-outline-v/20 flex gap-3">
        <input
          className="flex-1 bg-s-mid border border-outline-v/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface text-[14px] rounded-xl px-4 py-2.5 transition-all outline-none"
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type your message..."
        />
        <button 
          className="bg-primary hover:bg-primary-dim disabled:opacity-50 disabled:hover:bg-primary text-white font-bold text-[14px] px-5 rounded-xl transition-all shadow-[0_4px_14px_rgba(99,102,241,0.3)] disabled:shadow-none flex items-center justify-center shrink-0 group"
          onClick={handleSend} 
          disabled={!input.trim()}
        >
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">send</span>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
