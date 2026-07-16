import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { triggerHaptic } from '../../utils/haptics';

const TOAST_STYLES = {
  success: { bg: 'rgba(4, 120, 87, 0.96)', icon: <path d="M20 6 9 17l-5-5" /> },
  error: { bg: 'rgba(220, 38, 38, 0.96)', icon: <path d="M18 6 6 18M6 6l12 12" /> },
  warning: { bg: 'rgba(180, 83, 9, 0.96)', icon: <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /> },
  info: { bg: 'rgba(30, 64, 175, 0.96)', icon: <path d="m9 12 2 2 4-4" /> },
};

function ToastItem({ toast, onDismiss: onDismissProp }) {
  const onDismiss = onDismissProp;
  const [dismissStyle, setDismissStyle] = useState({});
  const touchStartX = useRef(null);
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setDismissStyle({
      transform: `translateX(${diff}px)`,
      opacity: Math.max(1 - Math.abs(diff) / 200, 0),
      transition: 'none'
    });
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 80) {
      triggerHaptic('close');
      onDismiss(toast.id);
    } else {
      setDismissStyle({
        transform: 'translateX(0)',
        opacity: 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      });
    }
    touchStartX.current = null;
  }, [toast.id, onDismiss]);

  return (
    <div 
      className="toast-item animate-toast-slide"
      style={{ ...dismissStyle, background: style.bg }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onDismiss(toast.id)}
      role="status"
    >
      <div className="toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" />
          {style.icon}
        </svg>
      </div>
      <div className="toast-message">{toast.text}</div>
    </div>
  );
}

export default function ToastContainer({ activeToasts }) {
  const [dismissed, setDismissed] = useState(new Set());

  const handleDismiss = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const visibleToasts = activeToasts.filter(t => !dismissed.has(t.id));

  return (
    <div className="toast-notifications-container">
      {visibleToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}

      <style>{`
        .toast-notifications-container {
          position: absolute;
          top: 60px;
          left: 20px;
          right: 20px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          color: #FFFFFF;
          padding: 12px 16px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          text-align: right;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: pan-y;
          user-select: none;
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .animate-toast-slide {
          animation: toastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes toastSlideDown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired
};

ToastContainer.propTypes = {
  activeToasts: PropTypes.array.isRequired
};
