import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../atoms/Avatar';

export default function CommentItem({ comment, members }) {
  // Try to find the sender in local members list if sender details not populated directly
  const sender = comment.sender || members.find(m => m.id === comment.senderId) || {
    name: 'مستخدم غير معروف',
    avatar: ''
  };

  return (
    <div 
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '15px',
        marginBottom: '10px',
        border: '1px solid var(--border)'
      }}
      className="comment-item"
    >
      <Avatar src={sender.avatar} alt={sender.name} size="sm" />
      <div style={{ flex: 1 }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px' 
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            {sender.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {comment.time || (comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          {comment.text}
        </p>
      </div>
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  members: PropTypes.array
};
