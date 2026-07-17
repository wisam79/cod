import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import PullToRefresh from '../atoms/PullToRefresh';
import { 
  BarChart3, 
  MessageSquare, 
  RefreshCw, 
  UserPlus, 
  AlertCircle, 
  Plus 
} from 'lucide-react';

export default function Dashboard() {
  const { tasks, members, currentUser, addTask, notifications, fetchInitialData } = useAppStore(useShallow(s => ({
    tasks: s.tasks,
    members: s.members,
    currentUser: s.currentUser,
    addTask: s.addTask,
    notifications: s.notifications,
    fetchInitialData: s.fetchInitialData,
  })));
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData().catch(() => {});
    setRefreshing(false);
  }, [fetchInitialData]);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAssignee, setQuickAssignee] = useState(null);

  useEffect(() => {
    if (members.length > 0 && quickAssignee === null) {
      setQuickAssignee(members[0].id);
    }
  }, [members, quickAssignee]);

  const user = currentUser || { id: 0, name: 'جاري التحميل...' };

  const myTasks = useMemo(() => tasks.filter(t => t.assigneeId === user.id), [tasks, user.id]);
  const myCompleted = useMemo(() => myTasks.filter(t => t.status === 'done').length, [myTasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === 'progress').length, [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const totalTasks = tasks.length;

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle,
      description: 'تمت إضافتها سرياً من لوحة التحكم.',
      assigneeId: quickAssignee,
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });

    setQuickTitle('');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageSquare size={14} />;
      case 'status':
        return <RefreshCw size={14} />;
      case 'comment':
        return <MessageSquare size={14} />;
      case 'assignment':
        return <UserPlus size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const progressPercent = myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0;
  const completedTasksPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasksPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="dashboard-view">
      {/* Card 1: Total Tasks */}
      <div className="card stat-card-full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: 'var(--space-5)', border: 'none', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={14} />
            إجمالي المهام
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginTop: '8px' }}>
            <span className="font-english" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{totalTasks}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>مهمة</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', fontSize: '0.72rem', fontWeight: 700, marginRight: '10px' }}>
              +8% من الأسبوع الماضي
            </div>
          </div>
        </div>
        <div style={{ color: 'var(--text-faint)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
      </div>

      {/* Card 2: Today's Schedule */}
      <div className="card stat-card-full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5)', border: 'none', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>جدول اليوم</span>
          <span className="font-english" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px', lineHeight: 1 }}>
            {myTasks.length} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>مهام مسندة</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '4px' }}>الإنتاجية اليومية للفريق</span>
        </div>
        
        {/* Vertical Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="font-english" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            {progressPercent}%
          </span>
          <div style={{ width: '6px', height: '56px', background: 'var(--border-light)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
            <div 
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                width: '100%', 
                height: `${progressPercent}%`, 
                background: 'var(--primary)', 
                borderRadius: '3px',
                transition: 'height 0.4s var(--ease-out)'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Row 3: Two columns (Completed & In Progress) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Completed Card */}
        <div className="card" style={{ padding: 'var(--space-4)', border: 'none', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>المهام المكتملة</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>آخر 30 يوم</span>
          <span className="font-english" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', lineHeight: 1 }}>
            {completedTasksPercent}%
          </span>
          <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
            <div 
              style={{ 
                width: `${completedTasksPercent}%`, 
                height: '100%', 
                background: 'var(--primary)', 
                borderRadius: '2px',
                transition: 'width 0.4s var(--ease-out)'
              }} 
            />
          </div>
        </div>

        {/* In Progress Card */}
        <div className="card" style={{ padding: 'var(--space-4)', border: 'none', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>قيد العمل</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>آخر 30 يوم</span>
          <span className="font-english" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', lineHeight: 1 }}>
            {inProgressTasksPercent}%
          </span>
          <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
            <div 
              style={{ 
                width: `${inProgressTasksPercent}%`, 
                height: '100%', 
                background: 'var(--primary)', 
                borderRadius: '2px',
                transition: 'width 0.4s var(--ease-out)'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="quick-add-section card" style={{ border: 'none' }}>
        <h3 className="section-title">إسناد مهمة سريعة</h3>
        <form onSubmit={handleQuickAddSubmit} className="quick-add-form">
          <input
            type="text"
            placeholder="اكتب اسم المهمة..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="quick-input"
            required
          />
          <div className="form-row">
            <select
              value={quickAssignee || ''}
              onChange={(e) => setQuickAssignee(Number(e.target.value))}
              className="quick-select"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>إسناد إلى: {m.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Plus size={16} />
              إضافة
            </button>
          </div>
        </form>
      </div>

      {/* Activity Feed */}
      <div className="activity-section card" style={{ border: 'none' }}>
        <div className="activity-header">
          <h3 className="section-title">الأنشطة الأخيرة</h3>
          <span className="live-badge">
            <span className="live-dot" />
            مباشر
          </span>
        </div>
        <div className="activity-list">
          {notifications.slice(0, 4).map((notif, index) => (
            <div key={notif.id || index} className="activity-item">
              <div className="activity-icon-wrap">
                {getNotifIcon(notif.type)}
              </div>
              <div className="activity-details">
                <p>{notif.text}</p>
                <span className="activity-time font-english">{notif.time || 'الآن'}</span>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="empty-state">لا توجد أنشطة مسجلة بعد.</div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .banner-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
          position: relative;
          z-index: 1;
        }

        .banner-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .banner-title h2 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0;
        }

        .banner-stats {
          position: relative;
          z-index: 1;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }

        .stat-card {
          padding: var(--space-4) var(--space-3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          text-align: center;
          transition: transform var(--dur-fast) var(--ease-in-out), box-shadow var(--dur-fast) var(--ease-in-out);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
        }

        .stat-icon-all {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .stat-icon-progress {
          background-color: var(--warning-light);
          color: var(--warning);
        }

        .stat-icon-done {
          background-color: var(--success-light);
          color: var(--success);
        }

        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
          margin-bottom: 2px;
        }

        .stat-info p {
          font-size: 0.6875rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Quick Add */
        .quick-add-section {
          padding: var(--space-5);
          text-align: right;
        }

        .section-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: var(--space-3);
        }

        .quick-add-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .quick-input {
          width: 100%;
          padding: 10px var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          font-size: 0.875rem;
          outline: none;
          text-align: right;
          background-color: var(--bg-card);
          color: var(--text-main);
          height: var(--tap-target);
          transition: border-color var(--dur-fast) var(--ease-in-out), box-shadow var(--dur-fast) var(--ease-in-out);
        }

        .quick-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .form-row {
          display: flex;
          gap: var(--space-2);
        }

        .quick-select {
          flex: 1;
          padding: 10px var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          font-size: 0.8125rem;
          outline: none;
          background-color: var(--bg-card);
          text-align: right;
          color: var(--text-main);
          height: 40px;
        }

        /* Activity Feed */
        .activity-section {
          padding: var(--space-5);
          text-align: right;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .activity-header .section-title {
          margin-bottom: 0;
        }

        .live-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--success);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          background: var(--success-light);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background-color: var(--success);
          border-radius: 50%;
          animation: pulse-indicator 1.5s infinite;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-light);
          transition: background-color var(--dur-fast) var(--ease-in-out);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-item:hover {
          background-color: var(--bg-elevated);
          border-radius: var(--radius-sm);
          margin: 0 calc(var(--space-2) * -1);
          padding-left: var(--space-2);
          padding-right: var(--space-2);
        }

        .activity-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
        }

        .activity-details {
          flex: 1;
          min-width: 0;
        }

        .activity-details p {
          font-size: 0.8125rem;
          color: var(--text-main);
          line-height: 1.4;
        }

        .activity-time {
          font-size: 0.6875rem;
          color: var(--text-faint);
          display: block;
          margin-top: 2px;
        }

        .empty-state {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8125rem;
          padding: var(--space-5) 0;
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}
