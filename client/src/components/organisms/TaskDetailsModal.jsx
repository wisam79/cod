import React, { useState, useRef, useCallback, useEffect } from 'react';
import CommentItem from '../molecules/CommentItem';
import ActionSheet from '../atoms/ActionSheet';
import { X, Send, Trash2, Calendar, Phone, MessageSquare } from 'lucide-react';
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
  const commentInputRef = useRef(null);
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
  const assignee = members.find(m => m.id === taskInStore.assigneeId) || { name: 'غير محدد', avatar: '' };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    triggerHaptic('light');
    addCommentToTask(task.id, commentText);
    setCommentText('');
  };

  return (
    <div className={`sheet-modal-overlay ${isClosing ? 'modal-fade-out' : ''}`} onClick={handleClose}>
      <div 
        ref={modalRef}
        className={`sheet-modal ${isClosing ? 'modal-slide-down' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ direction: 'rtl' }}
      >
        <div className="modal-header" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>تفاصيل المهمة</h2>
          <button className="close-btn" onClick={handleClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <div className="task-detail-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', flex: 1, padding: 'var(--space-5)' }}>
          {/* Centered Large Assignee Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: 'var(--space-2)' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={assignee?.avatar || 'https://via.placeholder.com/150'} 
                alt={assignee?.name} 
                style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }} 
              />
              <span className={`task-status-dot status-${taskInStore.status}`} style={{ position: 'absolute', bottom: '4px', right: '4px', width: '16px', height: '16px', border: '3px solid var(--bg-card)', borderRadius: '50%' }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>المسؤول: {assignee?.name || 'غير محدد'}</span>
          </div>

          {/* Main Info Card */}
          <div className="card" style={{ border: 'none', background: 'var(--bg-card)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{taskInStore.title}</h3>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                تاريخ الاستحقاق: <span className="font-english">{taskInStore.dueDate}</span>
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: '100%', margin: '8px 0 0 0' }}>
              {taskInStore.description}
            </p>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button 
              onClick={() => {
                triggerHaptic('light');
                alert(`جاري الاتصال بـ ${assignee?.name || 'المسؤول'}...`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: 'none',
                borderRadius: '24px',
                height: '44px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'transform 0.2s var(--ease-out)',
                padding: 0
              }}
              className="pressable"
            >
              <Phone size={16} />
              اتصال الآن
            </button>
            
            <button 
              onClick={() => {
                triggerHaptic('light');
                commentInputRef.current?.focus();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: 'none',
                borderRadius: '24px',
                height: '44px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'transform 0.2s var(--ease-out)',
                padding: 0
              }}
              className="pressable"
            >
              <MessageSquare size={16} />
              أرسل رسالة
            </button>
          </div>

          {/* Active Services (Metadata grid) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'right', margin: 0 }}>بيانات المهمة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              
              {/* Row 1: Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حالة المهمة</span>
                <select 
                  value={taskInStore.status} 
                  onChange={(e) => {
                    triggerHaptic('light');
                    updateTaskStatus(task.id, e.target.value);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    padding: 0,
                    width: 'auto',
                    height: 'auto'
                  }}
                  className={`status-select status-${taskInStore.status}`}
                >
                  <option value="todo">في الانتظار</option>
                  <option value="progress">قيد العمل</option>
                  <option value="review">قيد المراجعة</option>
                  <option value="done">مكتملة</option>
                </select>
              </div>

              {/* Row 2: Priority */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الأولوية</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <span className={`badge badge-priority-${taskInStore.priority}`} style={{ padding: '2px 8px', borderRadius: '8px' }}>
                    {translatePriority(taskInStore.priority)}
                  </span>
                </span>
              </div>

              {/* Row 3: Creator/Role */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--space-4)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>المسؤول الحالي</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {assignee?.name || 'غير محدد'}
                </span>
              </div>

            </div>
          </div>

          {/* Comments Section */}
          <div className="detail-comments-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'right', borderBottom: '1px solid var(--border-light)', paddingBottom: 'var(--space-2)', margin: 0 }}>
              المناقشات والتعليقات ({taskInStore.comments?.length || 0})
            </h4>
            
            <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(taskInStore.comments || []).map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  members={members} 
                />
              ))}
              {(!taskInStore.comments || taskInStore.comments.length === 0) && (
                <p className="no-comments" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 'var(--space-4) 0', margin: 0 }}>
                  لا توجد مناقشات بعد. اكتب تعليقاً لبدء التواصل!
                </p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form" style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <input 
                ref={commentInputRef}
                type="text" 
                placeholder="اكتب تعليقاً أو استفساراً..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px var(--space-3)',
                  borderRadius: '24px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  textAlign: 'right',
                  height: '44px'
                }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px' }} aria-label="إرسال تعليق">
                <Send size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </form>
          </div>

          {/* Delete action */}
          <div className="modal-footer-actions" style={{ marginTop: 'var(--space-3)' }}>
            <button 
              className="btn btn-delete-task pressable" 
              onClick={() => setShowActionSheet(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', borderRadius: '24px', padding: 0 }}
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
