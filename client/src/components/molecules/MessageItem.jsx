import React from 'react';
import PropTypes from 'prop-types';
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
    backgroundColor: isCurrentUser ? 'var(--accent-light)' : 'var(--bg-card)',
    border: isCurrentUser ? 'none' : '1px solid var(--border)',
    color: 'var(--text-main)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)',
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
          <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '4px' }}>
            {sender.name}
          </div>
        )}
        <div style={{ fontSize: '0.9rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
          {message.text}
        </div>
        <div 
          style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-muted)', 
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

MessageItem.propTypes = {
  message: PropTypes.object.isRequired,
  members: PropTypes.array,
  isCurrentUser: PropTypes.bool
};
