import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { triggerHaptic } from '../../utils/haptics';

export default function ActionSheet({ isOpen, onClose, title, actions = [], cancelText = 'إلغاء' }) {
  const [animClass, setAnimClass] = useState('');
  const sheetRef = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setAnimClass('action-sheet-visible'));
      triggerHaptic('medium');
    } else {
      setAnimClass('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setAnimClass('action-sheet-hiding');
    triggerHaptic('close');
    setTimeout(onClose, 200);
  };

  const handleAction = (action) => {
    triggerHaptic(action.destructive ? 'error' : 'light');
    handleClose();
    setTimeout(() => action.onClick && action.onClick(), 220);
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    if (!touchStartY.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - (touchStartY.current || 0);
    touchStartY.current = null;
    if (diff > 80) handleClose();
    if (sheetRef.current) sheetRef.current.style.transform = '';
  };

  if (!isOpen && !animClass) return null;

  return (
    <div
      className={`action-sheet-overlay ${animClass}`}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        opacity: animClass === 'action-sheet-visible' ? 1 : 0,
        transition: 'opacity 0.25s ease',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%', maxWidth: 420, background: 'var(--bg-app)',
          borderRadius: '20px 20px 0 0', padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
          transform: `translateY(${animClass === 'action-sheet-visible' ? 0 : '100%'})`,
          transition: animClass === 'action-sheet-hiding' ? 'transform 0.2s ease' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--border)' }} />
        </div>
        {title && (
          <div style={{ textAlign: 'center', padding: '8px 0 12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {title}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action)}
              style={{
                width: '100%', padding: '14px 16px', border: 'none', borderRadius: 14,
                background: action.destructive ? 'rgba(255, 51, 0, 0.08)' : 'var(--bg-card)',
                color: action.destructive ? '#ff3300' : 'var(--text-main)',
                fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.12s ease',
              }}
            >
              {action.icon}{action.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleClose}
          style={{
            width: '100%', marginTop: 8, padding: '14px 16px', border: 'none', borderRadius: 14,
            background: 'var(--bg-card)', color: 'var(--text-main)',
            fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
}

ActionSheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    destructive: PropTypes.bool,
    icon: PropTypes.node,
  })),
  cancelText: PropTypes.string,
};