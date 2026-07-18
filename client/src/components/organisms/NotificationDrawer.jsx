import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from '../molecules/NotificationItem';
import { Bell, Trash2, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function NotificationDrawer({ isOpen, onClose, notifications, onClear }) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const drawerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = React.useCallback(() => {
    triggerHaptic('close');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, requestClose]);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const dx = touchStartX.current - e.touches[0].clientX;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    const isRTL = document.documentElement.dir === 'rtl';
    // In LTR the drawer is on the left and dismisses leftward (dx > 0).
    // In RTL the drawer is on the right and must dismiss rightward (dx < 0).
    const dismissing = isRTL ? dx < 0 : dx > 0;
    if (!dismissing) return;
    const clamped = Math.min(Math.abs(dx), 280);
    const sign = isRTL ? 1 : -1;
    drawerRef.current.style.transform = `translateX(${sign * clamped}px)`;
    drawerRef.current.style.opacity = String(Math.max(1 - clamped / 320, 0));
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const isRTL = document.documentElement.dir === 'rtl';
    const shouldDismiss = isRTL ? dx < -100 : dx > 100;
    drawerRef.current.style.transform = '';
    drawerRef.current.style.opacity = '';
    touchStartX.current = null;
    touchStartY.current = null;
    if (shouldDismiss) requestClose();
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={requestClose}>
      <div
        ref={drawerRef}
        className={`drawer-content text-right ${isClosing ? 'drawer-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="مركز التنبيهات"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="drawer-header">
          <h2>
            <Bell size={16} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
            مركز التنبيهات
          </h2>
          <button className="close-btn" onClick={requestClose} aria-label="إغلاق">
            <X size={14} />
          </button>
        </div>

        <div className="drawer-actions">
          {notifications.length > 0 && (
            <button
              className="btn-clear-all"
              onClick={() => { triggerHaptic('light'); onClear(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} />
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
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-start;
          animation: iosOverlayFade var(--dur-base) var(--ease-in-out) forwards;
        }

        .drawer-content {
          width: 84%;
          max-width: 340px;
          height: 100%;
          max-height: 100vh;
          overflow: hidden;
          border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          text-align: right;
          padding: var(--space-5) var(--space-4);
          background-color: var(--bg-app);
          border-right: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          animation: slideFromLeft var(--dur-slow) var(--ease-out) forwards;
          transition: transform var(--dur-slow) var(--ease-out), opacity var(--dur-base) var(--ease-in-out);
        }

        html[dir="rtl"] .drawer-overlay { justify-content: flex-end; }
        html[dir="rtl"] .drawer-content {
          border-radius: var(--radius-xl) 0 0 var(--radius-xl);
          border-right: none;
          border-left: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          animation-name: slideFromRight;
        }

        .drawer-content.drawer-closing {
          animation: slideOutLeft var(--dur-base) var(--ease-in-out) forwards;
        }
        html[dir="rtl"] .drawer-content.drawer-closing {
          animation-name: slideOutRight;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: var(--space-3);
        }

        .drawer-header h2 {
          font-size: 0.9375rem;
          font-weight: 700;
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
          font-weight: 600;
          cursor: pointer;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--dur-fast) var(--ease-in-out), color var(--dur-fast) var(--ease-in-out);
        }

        .btn-clear-all:hover {
          color: var(--danger);
          background: var(--danger-light);
        }

        .drawer-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding-bottom: calc(40px + var(--safe-bottom, 0px));
        }

        .drawer-item {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-3);
          background: var(--bg-card);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xs);
          border: 1px solid var(--border-light);
        }

        .drawer-item-icon {
          font-size: 1rem;
        }

        .drawer-item-details p {
          font-size: 0.8125rem;
          line-height: 1.4;
          color: var(--text-main);
        }

        .drawer-item-time {
          font-size: 0.6875rem;
          color: var(--text-faint);
          display: block;
          margin-top: 2px;
        }

        .drawer-empty-state {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8125rem;
          padding: var(--space-10) 0;
        }

        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(-100%); opacity: 0; }
        }

        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }

        @keyframes slideFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

NotificationDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.array,
  onClear: PropTypes.func.isRequired
};
