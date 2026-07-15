import React, { useState, useRef, useCallback, useEffect } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { X, Plus } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function AddTaskModal({ isOpen, onClose, onSubmit, members }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(members[0]?.id || 1);
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const touchStartY = useRef(null);
  const modalRef = useRef(null);

  const handleClose = useCallback(() => {
    triggerHaptic('close');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (window.history.state?.modal === 'addTask') {
        window.history.back();
      }
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleBack = () => {
      if (isOpen) handleClose();
    };
    window.history.pushState({ modal: 'addTask' }, '');
    window.addEventListener('popstate', handleBack);
    return () => {
      window.removeEventListener('popstate', handleBack);
    };
  }, [isOpen, handleClose]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null || !modalRef.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      modalRef.current.style.transform = `translateY(${Math.min(diff, 200)}px)`;
      modalRef.current.style.opacity = Math.max(1 - diff / 400, 0);
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null || !modalRef.current) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 120) {
      handleClose();
    } else {
      modalRef.current.style.transform = '';
      modalRef.current.style.opacity = '';
    }
    touchStartY.current = null;
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
    onClose();
  };

  return (
    <div className={`sheet-modal-overlay ${isClosing ? 'modal-fade-out' : ''}`} onClick={handleClose}>
      <div 
        ref={modalRef}
        className={`sheet-modal ${isClosing ? 'modal-slide-down' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-modal-handle" />
        <div className="modal-header">
          <h2>إضافة مهمة جديدة</h2>
          <button className="close-btn" onClick={handleClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <Input 
            label="اسم المهمة"
            placeholder="مثال: تصميم واجهة الشات"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Input 
            type="textarea"
            label="الوصف"
            placeholder="تفاصيل عن متطلبات هذه المهمة..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>المسؤول عنها</label>
              <select 
                value={newAssignee} 
                onChange={(e) => setNewAssignee(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-app)', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>الأولوية</label>
              <select 
                value={newPriority} 
                onChange={(e) => setNewPriority(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-app)', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)' }}
              >
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Input 
              type="date"
              label="تاريخ الاستحقاق"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <Plus size={16} />
            إضافة المهمة
          </Button>
        </form>
      </div>
    </div>
  );
}
