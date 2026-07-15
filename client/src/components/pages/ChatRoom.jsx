import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import PullToRefresh from '../atoms/PullToRefresh';
import MessageItem from '../molecules/MessageItem';
import { MessageSquare, Send } from 'lucide-react';

export default function ChatRoom() {
  const store = useAppStore();
  const { messages, members, currentUser, sendMessage, fetchMessages } = store;
  const [inputText, setInputText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Keyboard-aware: scroll to bottom when keyboard opens
  useEffect(() => {
    const handleResize = () => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages().catch(() => {});
    setRefreshing(false);
  }, [fetchMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    inputRef.current?.focus();
  };

  // Scroll to bottom when messages load/update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="chat-room-view">
      {/* Group Chat Banner Info */}
      <div className="chat-banner card">
        <div className="chat-banner-info">
          <h3>
            <MessageSquare size={16} style={{ verticalAlign: 'middle', marginLeft: '6px', color: 'var(--primary)' }} />
            المجموعة العامة للفريق
          </h3>
          <p>قناة للتواصل العام ومشاركة تحديثات العمل اليومية الفورية.</p>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="messages-container">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              members={members} 
              isCurrentUser={isMe} 
            />
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="chat-input-form">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="اكتب رسالتك هنا..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-chat-send" aria-label="إرسال رسالة">
          <Send size={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </form>

      <style>{`
        .chat-room-view {
          display: flex;
          flex-direction: column;
          height: calc(100% - 30px); /* Fill space in mockup, accounting for header spacing */
          position: relative;
        }

        .chat-banner {
          padding: 14px 20px;
          text-align: right;
          background: var(--bg-card);
          margin-bottom: 12px;
        }

        .chat-banner h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        .chat-banner p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 8px 4px 80px 4px; /* padding bottom to keep space from chat input */
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: right;
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }
        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .chat-input-form {
          position: absolute;
          bottom: 12px;
          left: 0;
          right: 0;
          display: flex;
          gap: 8px;
          background: var(--bg-app);
          padding: 10px 0px;
          border-top: 1px solid var(--border);
          z-index: 10;
        }

        .chat-input-form input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid var(--border);
          outline: none;
          font-size: 0.85rem;
          text-align: right;
          background: var(--bg-card);
        }

        .chat-input-form input:focus {
          border-color: var(--primary);
        }

        .btn-chat-send {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}
