import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../atoms/Badge';
import Avatar from '../atoms/Avatar';
import { translatePriority } from '../../utils/translations';

function TaskCardFn({ task, assignee, onSelect }) {
  const handleClick = React.useCallback(() => {
    if (onSelect) onSelect(task);
  }, [onSelect, task]);

  return (
    <div 
      className="task-card card animate-slide-up"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-card-header">
        <Badge type={task.priority} content={translatePriority(task.priority)} />
        <span className={`task-status-dot status-${task.status}`}></span>
      </div>
      
      <h3 className="task-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</h3>
      <p className="task-desc-preview">{task.description}</p>
      
      <div className="task-card-footer">
        <div className="task-meta">
          <span className="due-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {task.dueDate}
          </span>
          {task.comments?.length > 0 && (
            <span className="comment-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {task.comments.length}
            </span>
          )}
        </div>
        
        <div className="assignee-avatar-wrapper">
          <Avatar src={assignee?.avatar} alt={assignee?.name} size="sm" className="assignee-avatar" />
        </div>
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
