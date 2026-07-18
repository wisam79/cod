import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../atoms/Avatar';

export default function MessageItem({ message, members, isCurrentUser }) {
  const sender = message.sender || members.find(m => m.id === message.senderId) || {
    name: 'مستكشف غير معروف',
    avatar: ''
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        gap: 'var(--space-2)',
        alignItems: 'flex-end',
        marginBottom: 'var(--space-3)'
      }}
      className={`message-item ${isCurrentUser ? 'my-message' : ''}`}
    >
      <Avatar src={sender.avatar} alt={sender.name} size="sm" />
      <div style={{
        maxWidth: '75%',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: isCurrentUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        backgroundColor: isCurrentUser ? 'var(--primary-light)' : 'var(--bg-card)',
        border: isCurrentUser ? '1px solid rgba(255, 95, 56, 0.25)' : '1px solid var(--border)',
        color: 'var(--text-main)',
      }}>
        {!isCurrentUser && (
          <div style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '3px' }}>
            {sender.name}
          </div>
        )}
        <div style={{ fontSize: '0.875rem', lineHeight: '1.5', wordBreak: 'break-word' }}>
          {message.text}
        </div>
        <div 
          style={{ 
            fontSize: '0.6875rem', 
            color: 'var(--text-faint)', 
            textAlign: 'left', 
            marginTop: '4px',
            direction: 'ltr',
            fontFamily: 'var(--font-english)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {(() => {
            try {
              const dateValue = message.createdAt || message.time;
              const date = new Date(dateValue);
              return isNaN(date.getTime()) ? 'الآن' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch {
              return 'الآن';
            }
          })()}
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
