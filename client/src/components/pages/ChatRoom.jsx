import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import PullToRefresh from '../atoms/PullToRefresh';
import MessageItem from '../molecules/MessageItem';
import { MessageSquare, Send } from 'lucide-react';
import './ChatRoom.css';

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
    </div>
    </PullToRefresh>
  );
}
