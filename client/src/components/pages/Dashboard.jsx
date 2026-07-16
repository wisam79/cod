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
  Zap 
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
        return <MessageSquare size={16} className="text-primary" style={{ color: 'var(--primary)' }} />;
      case 'status':
        return <RefreshCw size={16} className="text-status" style={{ color: 'var(--status-review)' }} />;
      case 'comment':
        return <MessageSquare size={16} className="text-primary" style={{ color: 'var(--primary)' }} />;
      case 'assignment':
        return <UserPlus size={16} className="text-success" style={{ color: 'var(--priority-low)' }} />;
      default:
        return <AlertCircle size={16} className="text-muted" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
    <div className="dashboard-view">
      <div className="welcome-banner card">
        <div className="banner-content">
          <div className="banner-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={20} fill="currentColor" />
            <h2 style={{ margin: 0 }}>معدل الإنتاجية اليوم ممتاز</h2>
          </div>
          <p>لديك <strong>{myPending}</strong> مهام معلقة من أصل <strong>{myTasks.length}</strong> مهام موكلة إليك.</p>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${myTasks.length ? (myCompleted / myTasks.length) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="progress-percentage">
            {myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0}% مكتمل
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <span className="stat-icon all">
            <BarChart3 size={20} />
          </span>
          <div className="stat-info">
            <h3>{totalTasks}</h3>
            <p>المهام الكلية</p>
          </div>
        </div>
        
        <div className="stat-card card">
          <span className="stat-icon progress">
            <Clock size={20} />
          </span>
          <div className="stat-info">
            <h3>{inProgressTasks}</h3>
            <p>قيد العمل</p>
          </div>
        </div>

        <div className="stat-card card">
          <span className="stat-icon completed">
            <CheckCircle2 size={20} />
          </span>
          <div className="stat-info">
            <h3>{completedTasks}</h3>
            <p>المكتملة</p>
          </div>
        </div>
      </div>

      <div className="quick-add-task card">
        <h3 className="section-title">إسناد مهمة سريعة</h3>
        <form onSubmit={handleQuickAddSubmit} className="quick-add-form">
          <input
            type="text"
            placeholder="اكتب اسم المهمة الجديدة هنا..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="quick-input"
            required
          />
          <div className="form-row">
            <select
              value={quickAssignee}
              onChange={(e) => setQuickAssignee(e.target.value)}
              className="quick-select"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>إسناد إلى: {m.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-quick-add" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Plus size={16} />
              إضافة
            </button>
          </div>
        </form>
      </div>

      <div className="recent-activity card">
        <div className="activity-header">
          <h3 className="section-title">الأنشطة الأخيرة</h3>
          <span className="live-indicator">
            <span className="live-dot"></span>
            مباشر
          </span>
        </div>
        <div className="activity-list">
          {notifications.slice(0, 4).map((notif, index) => (
            <div key={notif.id || index} className="activity-item">
              <div className="activity-badge-icon">
                {getNotifIcon(notif.type)}
              </div>
              <div className="activity-details">
                <p>{notif.text}</p>
                <span className="activity-time">{notif.time || 'الآن'}</span>
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
          gap: 20px;
        }

        .welcome-banner {
          background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%);
          color: #FFFFFF;
          border: none;
          text-align: right;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .welcome-banner h2 {
          color: #FFFFFF;
          font-size: 1.3rem;
          font-weight: 800;
        }

        .welcome-banner p {
          font-size: 0.85rem;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .progress-bar-container {
          background-color: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .progress-bar-fill {
          background-color: #FFFFFF;
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }

        .progress-percentage {
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.9;
          font-family: var(--font-english);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-card {
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
        }

        .stat-icon.all {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .stat-icon.progress {
          background-color: rgba(180, 83, 9, 0.08);
          color: var(--priority-medium);
        }

        .stat-icon.completed {
          background-color: rgba(4, 120, 87, 0.08);
          color: var(--priority-low);
        }

        .stat-info h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
          margin-bottom: 2px;
          font-family: var(--font-english);
        }

        .stat-info p {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .quick-add-task {
          padding: 20px;
          text-align: right;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 14px;
        }

        .quick-add-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quick-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          font-size: 0.85rem;
          outline: none;
          text-align: right;
          background-color: var(--bg-app);
          transition: border-color 0.2s;
        }

        .quick-input:focus {
          border-color: var(--primary);
        }

        .form-row {
          display: flex;
          gap: 8px;
        }

        .quick-select {
          flex: 1;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          font-size: 0.8rem;
          outline: none;
          background-color: var(--bg-app);
          text-align: right;
        }

        .btn-quick-add {
          padding: 12px 20px;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        .recent-activity {
          padding: 20px;
          text-align: right;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .activity-header .section-title {
          margin-bottom: 0;
        }

        .live-indicator {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--priority-low);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background-color: var(--priority-low);
          border-radius: 50%;
          animation: pulse-green 1.5s infinite;
        }

        @keyframes pulse-green {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .activity-badge-icon {
          background-color: var(--bg-app);
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-details {
          flex: 1;
        }

        .activity-details p {
          font-size: 0.8rem;
          color: var(--text-main);
          line-height: 1.4;
        }

        .activity-time {
          font-size: 0.7rem;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
          font-family: var(--font-english);
        }

        .empty-state {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 20px 0;
        }
      `}</style>
    </div>
    </PullToRefresh>
  );
}
