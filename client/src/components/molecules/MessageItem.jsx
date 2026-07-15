import React from 'react';
import Avatar from '../atoms/Avatar';

export default function MessageItem({ message, members, isCurrentUser }) {
  const sender = message.sender || members.find(m => m.id === message.senderId) || {
    name: 'مستكشف غير معروف',
    avatar: ''
  };

  const bubbleStyle = {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: isCurrentUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    backgroundColor: isCurrentUser ? '#ffefe6' : '#ffffff',
    border: isCurrentUser ? 'none' : '1px solid #ffe5db',
    color: '#333333',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.02)',
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        gap: '10px',
        alignItems: 'flex-end',
        marginBottom: '15px'
      }}
      className={`message-item ${isCurrentUser ? 'my-message' : ''}`}
    >
      <Avatar src={sender.avatar} alt={sender.name} size="sm" />
      <div style={bubbleStyle}>
        {!isCurrentUser && (
          <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#ff5500', marginBottom: '4px' }}>
            {sender.name}
          </div>
        )}
        <div style={{ fontSize: '0.9rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
          {message.text}
        </div>
        <div 
          style={{ 
            fontSize: '0.7rem', 
            color: '#999999', 
            textAlign: 'left', 
            marginTop: '4px',
            direction: 'ltr'
          }}
        >
          {new Date(message.createdAt || message.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
