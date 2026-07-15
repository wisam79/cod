import React from 'react';
import NotificationItem from '../molecules/NotificationItem';
import { Bell, Trash2, X } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onClear }) {
  const touchStartX = React.useRef(null);
  const drawerRef = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const diff = touchStartX.current - e.touches[0].clientX;
    // Swipe left to close (since it slides from left in RTL)
    if (diff > 0) {
      drawerRef.current.style.transform = `translateX(-${diff}px)`;
      drawerRef.current.style.opacity = Math.max(1 - diff / 300, 0);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 100) {
      onClose();
    }
    drawerRef.current.style.transform = '';
    drawerRef.current.style.opacity = '';
    touchStartX.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay animate-fade-in" onClick={onClose}>
      <div 
        ref={drawerRef}
        className="drawer-content card text-right" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drawer-header">
          <h2>
            <Bell size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
            مركز التنبيهات
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-actions">
          {notifications.length > 0 && (
            <button className="btn-clear-all" onClick={onClear} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} />
              مسح الإشعارات
            </button>
          )}
        </div>

        <div className="drawer-list">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
          {notifications.length === 0 && (
            <div className="drawer-empty-state">
              <p>لا توجد تنبيهات جديدة حالياً.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          justify-content: flex-start; /* Slides out from the left */
        }

        .drawer-content {
          width: 80%;
          height: 100%;
          max-height: 100vh;
          overflow: hidden;
          border-radius: 0 24px 24px 0; /* Rounded right-side edge */
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: right;
          padding: 24px 16px;
          animation: slideFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background-color: var(--bg-app);
          border-right: 1px solid var(--border);
        }

        @keyframes slideFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .drawer-header h2 {
          font-size: 1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
        }

        .drawer-actions {
          display: flex;
          justify-content: flex-end;
          padding: 2px 0;
        }

        .btn-clear-all {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-clear-all:hover {
          color: var(--primary);
        }

        .drawer-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 40px;
        }

        .drawer-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px;
          background: var(--bg-card);
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }

        .drawer-item-icon {
          font-size: 1.1rem;
        }

        .drawer-item-details p {
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--text-main);
        }

        .drawer-item-time {
          font-size: 0.65rem;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
        }

        .drawer-empty-state {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 40px 0;
        }
      `}</style>
    </div>
  );
}
