import React, { useState, useRef, useCallback, useEffect } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { X, Plus } from 'lucide-react';
import { triggerHaptic, resetHapticDedupe } from '../../utils/haptics';

export default function AddTaskModal({ isOpen, onClose, onSubmit, members }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(members[0]?.id ?? null);
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const touchStartY = useRef(null);
  const touchStartX = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const firstFieldRef = useRef(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    triggerHaptic('close');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (window.history.state?.modal === 'addTask') {
        window.history.back();
      }
    }, 220);
  }, [onClose, isClosing]);

  useEffect(() => {
    if (!isOpen) {
      resetHapticDedupe();
      return;
    }
    const handleBack = () => {
      if (isOpen) handleClose();
    };
    window.history.pushState({ modal: 'addTask' }, '');
    window.addEventListener('popstate', handleBack);

    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);

    // Focus the first form input when opening
    const focusTimer = setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 280);

    return () => {
      window.removeEventListener('popstate', handleBack);
      window.removeEventListener('keydown', handleKey);
      clearTimeout(focusTimer);
    };
  }, [isOpen, handleClose]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null || !modalRef.current) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) return;
    const clamped = Math.min(dy, 240);
    const scale = Math.max(1 - clamped / 1200, 0.98);
    modalRef.current.style.transform = `translateY(${clamped}px) scale(${scale})`;
    modalRef.current.style.opacity = String(Math.max(1 - clamped / 500, 0));
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null || !modalRef.current) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const fastFlick = dy > 60 && (e.changedTouches[0].velocityY ?? 0) > 0.3;
    const shouldDismiss = dy > 120 || fastFlick;

    if (Math.abs(dy) > Math.abs(dx) && shouldDismiss) {
      modalRef.current.style.transform = '';
      modalRef.current.style.opacity = '';
      handleClose();
    } else {
      modalRef.current.style.transform = '';
      modalRef.current.style.opacity = '';
    }
    touchStartY.current = null;
    touchStartX.current = null;
  }, [handleClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const localNextDay = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    onSubmit({
      title: newTitle,
      description: newDesc || 'لا يوجد وصف.',
      assigneeId: newAssignee,
      priority: newPriority,
      status: 'todo',
      dueDate: newDueDate || localNextDay
    });

    triggerHaptic('submit');
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewDueDate('');
    handleClose();
  };

  const selectStyle = {
    width: '100%',
    padding: '10px var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    outline: 'none',
    fontSize: '0.875rem',
    color: 'var(--text-main)',
    height: 'var(--tap-target)',
    transition: 'border-color var(--dur-fast) var(--ease-in-out)'
  };

  return (
    <div
      ref={overlayRef}
      className={`sheet-modal-overlay ${isClosing ? 'modal-fade-out' : ''}`}
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`sheet-modal ${isClosing ? 'modal-slide-down' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-modal-handle" />
        <div className="modal-header">
          <h2 id="add-task-title">إضافة مهمة جديدة</h2>
          <button className="close-btn" onClick={handleClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <Input
            placeholder="اسم المهمة"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            ref={firstFieldRef}
          />

          <Input
            type="textarea"
            placeholder="الوصف التفصيلي للمهمة..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <div className="form-row" style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>المسؤول</label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(Number(e.target.value))}
                style={selectStyle}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>الأولوية</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={selectStyle}
              >
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <Input
              type="date"
              label="تاريخ الاستحقاق"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <Plus size={16} />
            إضافة المهمة
          </Button>
        </form>
      </div>
    </div>
  );
}
