import React, { useState, useRef, useCallback, useEffect } from 'react';
import CommentItem from '../molecules/CommentItem';
import ActionSheet from '../atoms/ActionSheet';
import { X, Send, Trash2, Calendar, User, Info } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { translatePriority } from '../../utils/translations';

export default function TaskDetailsModal({ 
  task, 
  tasks,
  members, 
  currentUser, 
  updateTaskStatus, 
  addCommentToTask, 
  deleteTask, 
  onClose 
}) {
  const [commentText, setCommentText] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const touchStartY = useRef(null);
  const modalRef = useRef(null);
  const statusChangeTimeoutRef = useRef(null);

  const handleClose = useCallback(() => {
    triggerHaptic('close');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (window.history.state?.modal === 'taskDetails') {
        window.history.back();
      }
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!task) return;
    const handleBack = () => {
      if (task) handleClose();
    };
    window.history.pushState({ modal: 'taskDetails' }, '');
    window.addEventListener('popstate', handleBack);
    return () => {
      window.removeEventListener('popstate', handleBack);
      if (statusChangeTimeoutRef.current) {
        clearTimeout(statusChangeTimeoutRef.current);
      }
    };
  }, [task, handleClose]);

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

  if (!task) return null;

  const taskInStore = tasks.find(t => t.id === task.id) || task;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    triggerHaptic('light');
    addCommentToTask(task.id, commentText);
    setCommentText('');
  };

  const selectStyle = {
    width: '100%',
    padding: '10px var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    outline: 'none',
    fontSize: '0.875rem',
    fontWeight: '700',
    height: 'var(--tap-target)',
    transition: 'border-color var(--dur-fast) var(--ease-in-out)'
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
        role="dialog"
        aria-modal="true"
      >
        <div className="sheet-modal-handle" />
        <div className="modal-header">
          <h2>تفاصيل المهمة</h2>
          <button className="close-btn" onClick={handleClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <div className="task-detail-body">
          <h3 className="detail-task-title">{taskInStore.title}</h3>
          <p className="detail-task-desc">{taskInStore.description}</p>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} />
                حالة المهمة:
              </span>
              <select 
                value={taskInStore.status} 
                onChange={(e) => {
                  triggerHaptic('light');
                  if (statusChangeTimeoutRef.current) {
                    clearTimeout(statusChangeTimeoutRef.current);
                  }
                  statusChangeTimeoutRef.current = setTimeout(() => {
                    updateTaskStatus(task.id, e.target.value);
                  }, 300);
                }}
                style={selectStyle}
                className={`status-select status-${taskInStore.status}`}
              >
                <option value="todo">في الانتظار</option>
                <option value="progress">قيد العمل</option>
                <option value="review">قيد المراجعة</option>
                <option value="done">مكتملة</option>
              </select>
            </div>

            <div className="detail-item">
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                تاريخ الاستحقاق:
              </span>
              <span className="val font-english">{taskInStore.dueDate}</span>
            </div>

            <div className="detail-item">
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} />
                المسؤول:
              </span>
              <span className="val">
                {members.find(m => m.id === taskInStore.assigneeId)?.name || 'غير محدد'}
              </span>
            </div>

            <div className="detail-item">
              <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} />
                الأولوية:
              </span>
              <span className="val">
                <span className={`badge badge-priority-${taskInStore.priority}`}>
                  {translatePriority(taskInStore.priority)}
                </span>
              </span>
            </div>
          </div>

          <div className="detail-comments-section">
            <h4>المناقشات والتعليقات ({taskInStore.comments?.length || 0})</h4>
            <div className="comments-list">
              {(taskInStore.comments || []).map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  members={members} 
                />
              ))}
              {(!taskInStore.comments || taskInStore.comments.length === 0) && (
                <p className="no-comments">لا توجد مناقشات بعد. اكتب تعليقاً لبدء التواصل!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <input 
                type="text" 
                placeholder="اكتب تعليقاً أو استفساراً..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" aria-label="إرسال تعليق">
                <Send size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </form>
          </div>

          <div className="modal-footer-actions">
            <button 
              className="btn btn-delete-task pressable" 
              onClick={() => setShowActionSheet(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Trash2 size={16} />
              حذف المهمة
            </button>
          </div>
        </div>
      </div>
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="هل أنت متأكد من حذف هذه المهمة؟"
        actions={[
          {
            label: 'حذف المهمة',
            onClick: () => {
              triggerHaptic('error');
              deleteTask(task.id);
              handleClose();
            },
            destructive: true,
            icon: <Trash2 size={18} style={{ marginLeft: 6 }} />,
          }
        ]}
      />
    </div>
  );
}
