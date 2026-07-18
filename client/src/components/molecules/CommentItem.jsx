import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../atoms/Avatar';
import { Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function CommentItem({ comment, members, currentUser, onDelete }) {
  const sender = comment.sender || members.find(m => m.id === comment.senderId) || {
    name: 'مستخدم غير معروف',
    avatar: ''
  };

  const isSuperAdmin = currentUser && currentUser.role && (currentUser.role.includes('الادمن المطور') || currentUser.role.includes('Super Admin'));
  const isOwner = currentUser && (comment.senderId === currentUser.id);
  const canDelete = isOwner || isSuperAdmin;

  const formattedTime = (() => {
    const timeVal = comment.time;
    if (timeVal && typeof timeVal === 'string' && !timeVal.includes('T')) {
      return timeVal;
    }
    try {
      const dateValue = comment.createdAt || timeVal;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'الآن' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'الآن';
    }
  })();

  return (
    <div 
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-2)',
        border: '1px solid var(--border-light)'
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
          <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
            {sender.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-english" style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>
              {formattedTime}
            </span>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
                    onDelete();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--error)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                title="حذف التعليق"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          {comment.text}
        </p>
      </div>
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  members: PropTypes.array,
  currentUser: PropTypes.object,
  onDelete: PropTypes.func
};
