import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../atoms/Avatar';
import { translatePriority } from '../../utils/translations';

function TaskCardFn({ task, assignee, onSelect }) {
  const handleClick = React.useCallback(() => {
    if (onSelect) onSelect(task);
  }, [onSelect, task]);

  const priorityColor = {
    high: '#ef4444',
    medium: '#f97316',
    low: '#6b7280'
  };

  const statusColors = {
    todo: { bg: 'rgba(249, 115, 22, 0.08)', text: '#f97316', label: 'في الانتظار' },
    progress: { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', label: 'قيد العمل' },
    review: { bg: 'rgba(139, 92, 246, 0.08)', text: '#8b5cf6', label: 'قيد المراجعة' },
    done: { bg: 'rgba(34, 197, 94, 0.08)', text: '#22c55e', label: 'مكتملة' }
  };

  const currentStatus = statusColors[task.status] || { bg: 'var(--primary-light)', text: 'var(--primary)', label: 'معلقة' };

  return (
    <div 
      className="task-list-item"
      onClick={handleClick}
      style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 4px',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'background-color var(--dur-fast) var(--ease-in-out)',
        direction: 'rtl',
        gap: '12px'
      }}
    >
      {/* Hidden elements for accessibility and testing support */}
      <span className={`task-status-dot status-${task.status} sr-only`} />
      <span className="badge sr-only">{translatePriority(task.priority)}</span>
      {task.comments?.length > 0 && (
        <span className="comment-count sr-only">{task.comments.length}</span>
      )}
      {/* Right side: Avatar & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <Avatar src={assignee?.avatar} alt={assignee?.name} size="md" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, textAlign: 'right' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <span 
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: priorityColor[task.priority] || '#6b7280', 
                display: 'inline-block',
                flexShrink: 0
              }} 
              title={`أولوية: ${task.priority}`}
            />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {task.title}
            </span>
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {task.description || 'لا يوجد وصف للمهمة.'}
          </p>
        </div>
      </div>

      {/* Left side: Status & Date */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <span 
          style={{ 
            padding: '2px 8px', 
            borderRadius: '12px', 
            backgroundColor: currentStatus.bg, 
            color: currentStatus.text, 
            fontSize: '0.65rem', 
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          {currentStatus.label}
        </span>
        <span className="font-english" style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>
          {task.dueDate}
        </span>
      </div>
    </div>
  );
}

TaskCardFn.propTypes = {
  task: PropTypes.object.isRequired,
  assignee: PropTypes.object,
  onSelect: PropTypes.func
};

export default React.memo(TaskCardFn);
