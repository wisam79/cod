import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { triggerHaptic } from '../../utils/haptics';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const TOAST_CONFIG = {
  success: { bg: 'rgba(4, 120, 87, 0.96)', Icon: CheckCircle2 },
  error: { bg: 'rgba(220, 38, 38, 0.96)', Icon: XCircle },
  warning: { bg: 'rgba(180, 83, 9, 0.96)', Icon: AlertTriangle },
  info: { bg: 'rgba(30, 64, 175, 0.96)', Icon: Info },
};

function ToastItem({ toast, onDismiss: onDismissProp }) {
  const onDismiss = onDismissProp;
  const [dismissStyle, setDismissStyle] = useState({});
  const touchStartX = useRef(null);
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const IconComponent = config.Icon;

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
        transition: 'all var(--dur-base) var(--ease-out)'
      });
    }
    touchStartX.current = null;
  }, [toast.id, onDismiss]);

  return (
    <div 
      className="toast-item"
      style={{ ...dismissStyle, background: config.bg }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onDismiss(toast.id)}
      role="status"
    >
      <div className="toast-icon">
        <IconComponent size={16} />
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
    <div className="toast-notifications-container" aria-live="polite">
      {visibleToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}

      <style>{`
        .toast-notifications-container {
          position: absolute;
          top: 56px;
          left: var(--space-4);
          right: var(--space-4);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          color: #FFFFFF;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 0.8125rem;
          font-weight: 600;
          text-align: right;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: pan-y;
          user-select: none;
          animation: toastSlideDown var(--dur-slow) var(--ease-out) forwards;
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
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
