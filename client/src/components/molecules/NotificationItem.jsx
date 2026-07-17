import React from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, RefreshCw, UserPlus, AlertCircle } from 'lucide-react';

export default function NotificationItem({ notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'chat': 
        return <MessageSquare size={16} className="notif-svg" style={{ color: 'var(--primary)' }} />;
      case 'status': 
        return <RefreshCw size={16} className="notif-svg" style={{ color: 'var(--status-review)' }} />;
      case 'comment': 
        return <MessageSquare size={16} className="notif-svg" style={{ color: 'var(--primary)' }} />;
      case 'assignment': 
        return <UserPlus size={16} className="notif-svg" style={{ color: 'var(--priority-low)' }} />;
      default: 
        return <AlertCircle size={16} className="notif-svg" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="drawer-item">
      <div className="drawer-item-icon">
        {getIcon()}
      </div>
      <div className="drawer-item-details">
        <p>{notification.text}</p>
        <span className="drawer-item-time font-english">
          {notification.time || (() => {
            try {
              const date = notification.createdAt?.toDate ? notification.createdAt.toDate() : new Date(notification.createdAt);
              return isNaN(date.getTime()) ? 'الآن' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch {
              return 'الآن';
            }
          })()}
        </span>
      </div>
    </div>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired
};
