import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import NotificationItem from '../molecules/NotificationItem';
import { Bell, Trash2, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function NotificationDrawer({ isOpen, onClose, notifications, onClear }) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const drawerRef = useRef(null);
  const startedOnHandleRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = React.useCallback(() => {
    triggerHaptic('close');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
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
    // A swipe starts from the drawer edge (first 32px) — measuring where the
    // drawer lives avoids hijacking horizontal scrolls inside the list.
    startedOnHandleRef.current = false;
    if (drawerRef.current) {
      const r = drawerRef.current.getBoundingClientRect();
      const isRTL = getComputedStyle(drawerRef.current).direction === 'rtl';
      const edge = isRTL ? (window.innerWidth - r.right) : r.left;
      startedOnHandleRef.current = edge <= 32;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const dx = touchStartX.current - e.touches[0].clientX;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return; // vertical scroll on the list
    if (dx <= 0) return; // only allow "pull toward the parked edge"
    const clamped = Math.min(dx, 280);
    drawerRef.current.style.transform = `translateX(-${clamped}px)`;
    drawerRef.current.style.opacity = String(Math.max(1 - clamped / 320, 0));
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !drawerRef.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const vx = Math.abs(e.changedTouches[0].velocityX ?? 0);
    const shouldDismiss = dx > 100 || (dx > 40 && vx > 0.4);
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
        className={`drawer-content card text-right ${isClosing ? 'drawer-closing' : ''}`}
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
            <Bell size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
            مركز التنبيهات
          </h2>
          <button className="close-btn pressable" onClick={requestClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-actions">
          {notifications.length > 0 && (
            <button
              className="btn-clear-all pressable"
              onClick={() => { triggerHaptic('light'); onClear(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
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
          background: rgba(15, 23, 42, 0.45);
          z-index: 1000;
          display: flex;
          justify-content: flex-start; /* slides from left in LTR, right in RTL via logical properties */
          animation: iosOverlayFade 0.22s var(--ease-ios) forwards;
        }

        .drawer-content {
          width: 84%;
          max-width: 360px;
          height: 100%;
          max-height: 100vh;
          overflow: hidden;
          border-radius: 0 24px 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: right;
          padding: 24px 16px;
          background-color: var(--bg-app);
          border-right: 1px solid var(--border);
          box-shadow: 18px 0 40px rgba(15, 23, 42, 0.18);
          animation: slideFromLeft 0.32s var(--ease-ios) forwards;
          transition: transform 0.3s var(--ease-ios), opacity 0.2s var(--ease-quick);
        }

        /* RTL: anchor on the visual right side */
        html[dir="rtl"] .drawer-overlay { justify-content: flex-end; }
        html[dir="rtl"] .drawer-content {
          border-radius: 24px 0 0 24px;
          border-right: none;
          border-left: 1px solid var(--border);
          box-shadow: -18px 0 40px rgba(15, 23, 42, 0.18);
          animation-name: slideFromRight;
        }

        .drawer-content.drawer-closing {
          animation: slideOutLeft 0.22s var(--ease-quick) forwards;
        }
        html[dir="rtl"] .drawer-content.drawer-closing {
          animation-name: slideOutRight;
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
          padding: 8px 10px;
          border-radius: 10px;
          min-height: 36px;
        }

        .btn-clear-all:hover {
          color: var(--primary);
          background: var(--primary-light);
        }

        .drawer-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: calc(40px + var(--safe-bottom, 0px));
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
