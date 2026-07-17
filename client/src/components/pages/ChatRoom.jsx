import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import PullToRefresh from '../atoms/PullToRefresh';
import MessageItem from '../molecules/MessageItem';
import { MessageSquare, Send } from 'lucide-react';

export default function ChatRoom() {
  const { messages, members, currentUser, sendMessage, fetchMessages } = useAppStore(useShallow(s => ({
    messages: s.messages,
    members: s.members,
    currentUser: s.currentUser,
    sendMessage: s.sendMessage,
    fetchMessages: s.fetchMessages,
  })));
  const [inputText, setInputText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (messages.length > 0) {
      if (isNearBottomRef.current) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && fetchMessages) {
      fetchMessages();
    }
  }, [fetchMessages, messages.length]);

  useEffect(() => {
    if (!window.visualViewport) return;
    const inputForm = document.querySelector('.chat-input-form');
    const onResize = () => {
      const offsetFromBottom = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
      if (inputForm) {
        inputForm.style.transform = `translateY(${-offsetFromBottom}px)`;
      }
      if (isNearBottomRef.current) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.visualViewport.addEventListener('resize', onResize);
    window.visualViewport.addEventListener('scroll', onResize);
    return () => {
      window.visualViewport.removeEventListener('resize', onResize);
      window.visualViewport.removeEventListener('scroll', onResize);
    };
  }, []);

  const onScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
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

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="chat-room-view">
      <div className="chat-header card">
        <div className="chat-header-content">
          <MessageSquare size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div className="chat-header-text">
            <h3>المجموعة العامة</h3>
            <p>{members.length} أعضاء</p>
          </div>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef} onScroll={onScroll}>
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <div className="empty-state-icon">
              <MessageSquare size={24} />
            </div>
            <p className="empty-title">لا توجد رسائل بعد</p>
            <p className="empty-subtitle">ابدأ المحادثة مع فريقك.</p>
          </div>
        )}
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

      <form onSubmit={handleSend} className="chat-input-form">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="اكتب رسالتك..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary chat-send-btn" aria-label="إرسال رسالة">
          <Send size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </form>

      <style>{`
        .chat-room-view {
          display: flex;
          flex-direction: column;
          height: calc(100% - 30px);
          position: relative;
        }

        .chat-header {
          padding: var(--space-3) var(--space-4);
          margin-bottom: var(--space-3);
          background: var(--primary-gradient);
          color: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
        }

        .chat-header-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .chat-header-text h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fff;
        }

        .chat-header-text p {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-2) var(--space-1) 80px var(--space-1);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          text-align: right;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }

        .chat-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: var(--space-3);
          padding: var(--space-12) var(--space-6);
          color: var(--text-muted);
        }

        .messages-container::-webkit-scrollbar {
          width: 3px;
        }
        .messages-container::-webkit-scrollbar-thumb {
          background: var(--border-light);
          border-radius: 2px;
        }

        .chat-input-form {
          position: absolute;
          bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          display: flex;
          gap: var(--space-2);
          background: var(--bg-app);
          padding: var(--space-3) var(--space-3) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid var(--border-light);
          z-index: 10;
          transition: transform var(--dur-fast) var(--ease-in-out);
        }

        .chat-input-form input {
          flex: 1;
          padding: 10px var(--space-3);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          outline: none;
          font-size: 0.875rem;
          text-align: right;
          background: var(--bg-card);
          color: var(--text-main);
          height: var(--tap-target);
          transition: border-color var(--dur-fast) var(--ease-in-out), box-shadow var(--dur-fast) var(--ease-in-out);
        }

        .chat-input-form input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-gradient) !important;
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.25);
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}
