import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import PullToRefresh from '../atoms/PullToRefresh';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  RefreshCw, 
  UserPlus, 
  AlertCircle, 
  Plus, 
  TrendingUp 
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
  const myPending = useMemo(() => myTasks.length - myCompleted, [myTasks, myCompleted]);
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

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="dashboard-view">
      {/* Progress Banner */}
      <div className="progress-banner" style={{
        background: 'var(--primary-gradient)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        textAlign: 'right',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(30, 64, 175, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', right: '-10px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="banner-top">
          <div className="banner-title" style={{ color: 'rgba(255,255,255,0.9)' }}>
            <TrendingUp size={16} />
            <h2 style={{ color: '#fff', margin: 0 }}>الإنتاجية اليومية</h2>
          </div>
          <span className="banner-percent font-english" style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>{progressPercent}%</span>
        </div>
        <div className="banner-bar-track" style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
          <div 
            className="banner-bar-fill" 
            style={{ width: `${progressPercent}%`, background: '#fff', height: '100%', borderRadius: '3px', transition: 'width 0.4s var(--ease-out)' }}
          />
        </div>
        <div className="banner-stats" style={{ display: 'flex', gap: 'var(--space-5)', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.85)' }}>
          <div className="banner-stat" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <span>المتبقي: <strong className="font-english">{myPending}</strong></span>
          </div>
          <div className="banner-stat" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
            <span>المكتمل: <strong className="font-english">{myCompleted}</strong></span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span className="stat-icon stat-icon-all">
            <BarChart3 size={18} />
          </span>
          <div className="stat-info">
            <h3 className="font-english">{totalTasks}</h3>
            <p>الكلية</p>
          </div>
        </div>
        
        <div className="stat-card card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span className="stat-icon stat-icon-progress">
            <Clock size={18} />
          </span>
          <div className="stat-info">
            <h3 className="font-english">{inProgressTasks}</h3>
            <p>قيد العمل</p>
          </div>
        </div>

        <div className="stat-card card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span className="stat-icon stat-icon-done">
            <CheckCircle2 size={18} />
          </span>
          <div className="stat-info">
            <h3 className="font-english">{completedTasks}</h3>
            <p>مكتملة</p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="quick-add-section card">
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
              value={quickAssignee}
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
      <div className="activity-section card">
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
