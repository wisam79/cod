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
      <div className="chat-banner card">
        <div className="chat-banner-info">
          <h3>
            <MessageSquare size={16} style={{ verticalAlign: 'middle', marginLeft: '6px', color: 'var(--primary)' }} />
            المجموعة العامة للفريق
          </h3>
          <p>قناة للتواصل العام ومشاركة تحديثات العمل اليومية الفورية.</p>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef} onScroll={onScroll}>
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
          height: calc(100% - 30px);
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
          padding: 8px 4px 80px 4px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: right;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
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
          bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          display: flex;
          gap: 8px;
          background: var(--bg-app);
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid var(--border);
          z-index: 10;
          transition: transform 0.2s ease;
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
