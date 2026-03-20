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
  }, [messages]);

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

  if (loading) return <div style={S.loading}>Loading chat...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.headerTitle}>💬 Task Chat</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Messages are private to task participants</span>
      </div>

      <div style={S.messages}>
        {messages.length === 0 && (
          <div style={S.emptyChat}>No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg, i) => {
          const mine = isMine(msg);
          return (
            <div key={i} style={{ ...S.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              {!mine && (
                <div style={{ ...S.avatar, background: 'var(--violet)', color: '#fff' }}>
                  {(msg.senderId?.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                {!mine && <div style={S.senderName}>{msg.senderId?.name}</div>}
                <div style={{ ...S.bubble, ...(mine ? S.bubbleMine : S.bubbleOther) }}>
                  {msg.content}
                </div>
                <div style={{ ...S.msgTime, textAlign: mine ? 'right' : 'left' }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={S.typingIndicator}>
            <span>•</span><span>•</span><span>•</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={S.inputRow}>
        <input
          style={S.chatInput}
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
        />
        <button style={S.sendBtn} onClick={handleSend} disabled={!input.trim()}>
          Send →
        </button>
      </div>
    </div>
  );
};

const S = {
  wrap: { border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)', marginTop: 20 },
  header: { padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontWeight: 700, fontSize: 14 },
  messages: { height: 320, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 },
  emptyChat: { textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, padding: '40px 0' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  senderName: { fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 3, paddingLeft: 4 },
  bubble: { padding: '9px 13px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5, wordBreak: 'break-word' },
  bubbleMine: { background: 'var(--violet)', color: '#fff', borderBottomRightRadius: 4 },
  bubbleOther: { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink)', borderBottomLeftRadius: 4 },
  msgTime: { fontSize: 10, color: 'var(--ink-4)', marginTop: 3, paddingHorizontal: 4 },
  typingIndicator: { display: 'flex', gap: 3, paddingLeft: 36 },
  inputRow: { padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 },
  chatInput: { flex: 1, padding: '9px 13px', border: '1.5px solid var(--border-2)', borderRadius: 8, fontSize: 13.5, background: 'var(--surface)' },
  sendBtn: { background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 },
};

export default ChatWindow;
