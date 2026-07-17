import { ArrowRight, ChevronLeft, Mail, Phone, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../atoms/Avatar';

export default function TeamDirectory() {
  const members = useAppStore(s => s.members);
  const tasks = useAppStore(s => s.tasks);
  const currentUser = useAppStore(s => s.currentUser);
  const [selectedMember, setSelectedMember] = useState(null);

  const getMemberTaskStats = (memberId) => {
    const memberTasks = tasks.filter(t => t.assigneeId === memberId);
    const completed = memberTasks.filter(t => t.status === 'done').length;
    const active = memberTasks.length - completed;
    const progressPercent = memberTasks.length ? Math.round((completed / memberTasks.length) * 100) : 100;
    return { active, completed, progressPercent };
  };

  const handleMemberClick = (member) => {
    const stats = getMemberTaskStats(member.id);
    setSelectedMember({ ...member, ...stats });
  };

  const user = currentUser || members[0] || { id: 0, name: 'جاري التحميل...' };
  const currentUserStats = getMemberTaskStats(user.id);

  return (
    <div className="team-directory-wrapper" style={{ height: '100%' }}>
      {selectedMember ? (
        <div className="member-profile-view animate-fade-in text-right">
          <button className="back-btn" onClick={() => setSelectedMember(null)}>
            <ArrowRight size={14} />
            العودة
          </button>

          <div className="profile-hero card">
            <div className="profile-hero-content">
              <Avatar src={selectedMember.avatar} alt={selectedMember.name} size="lg" className="profile-avatar-lg" />
              <div className="profile-hero-info">
                <h3>{selectedMember.name}</h3>
                <p>{selectedMember.role}</p>
              </div>
              <div className="progress-ring-wrap">
                <svg viewBox="0 0 36 36" className="progress-ring" width="48" height="48">
                  <path className="ring-bg" fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="ring-fill" fill="none"
                    strokeDasharray={`${selectedMember.progressPercent}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="ring-text font-english">{selectedMember.progressPercent}%</text>
                </svg>
                <span className="ring-label">الإنجاز</span>
              </div>
            </div>
          </div>

          <h4 className="settings-section-title">بيانات العمل</h4>
          <div className="settings-list card">
            <div className="settings-item">
              <span className="settings-item-label">المهام النشطة</span>
              <span className="settings-item-value font-english" style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedMember.active}</span>
            </div>
            <div className="settings-item">
              <span className="settings-item-label">المكتملة</span>
              <span className="settings-item-value font-english">{selectedMember.completed}</span>
            </div>
            <div className="settings-item">
              <span className="settings-item-label">الدور الوظيفي</span>
              <span className="settings-item-value">{selectedMember.role}</span>
            </div>
          </div>

          <h4 className="settings-section-title">إجراءات التواصل</h4>
          <div className="settings-list card">
            <div className="settings-item clickable">
              <div className="settings-item-left">
                <Mail size={14} style={{ color: 'var(--primary)' }} />
                <span>بريد إلكتروني</span>
              </div>
              <ChevronLeft size={14} className="chevron-icon" />
            </div>
            <div className="settings-item clickable">
              <div className="settings-item-left">
                <Phone size={14} style={{ color: 'var(--primary)' }} />
                <span>اتصال هاتفي</span>
              </div>
              <ChevronLeft size={14} className="chevron-icon" />
            </div>
            <div className="settings-item clickable">
              <div className="settings-item-left">
                <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                <span>رسالة خاصة</span>
              </div>
              <ChevronLeft size={14} className="chevron-icon" />
            </div>
          </div>
        </div>
      ) : (
        <div className="team-directory-view animate-fade-in text-right">
          <div className="current-user-card card" onClick={() => handleMemberClick(user)} style={{ cursor: 'pointer' }}>
            <div className="profile-compact-header">
              <Avatar src={user.avatar} alt={user.name} size="md" />
              <div className="profile-compact-info">
                <h3>{user.name} (أنت)</h3>
                <p>{user.role}</p>
              </div>
              <div className="mini-ring">
                <svg viewBox="0 0 36 36" className="progress-ring" width="36" height="36">
                  <path className="ring-bg" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ring-fill" fill="none" strokeDasharray={`${currentUserStats.progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="ring-text font-english">{currentUserStats.progressPercent}%</text>
                </svg>
              </div>
            </div>
          </div>

          <h3 className="section-title">أعضاء الفريق ({members.length})</h3>

          <div className="team-members-list">
            {members.map(member => {
              const stats = getMemberTaskStats(member.id);
              return (
                <div key={member.id} className="member-card card" onClick={() => handleMemberClick(member)} style={{ cursor: 'pointer' }}>
                  <div className="member-card-content">
                    <Avatar src={member.avatar} alt={member.name} size="md" />
                    <div className="member-list-info">
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                  </div>

                  <div className="member-workload">
                    <div className="workload-text">
                      <span>عبء العمل:</span>
                      <span className="font-english">{stats.active} مهام</span>
                    </div>
                    <div className="workload-bar-track">
                      <div 
                        className="workload-bar-fill" 
                        style={{ 
                          width: `${Math.min((stats.active / 5) * 100, 100)}%`,
                          backgroundColor: stats.active > 3 ? 'var(--priority-high)' : stats.active > 1 ? 'var(--priority-medium)' : 'var(--success)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="member-card-footer font-english">
                    <span>مكتملة: {stats.completed}</span>
                    <span>الإنجاز: {stats.progressPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .team-directory-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .text-right {
          text-align: right;
        }

        .current-user-card {
          border: none;
          background: var(--primary-gradient);
          color: #fff;
          box-shadow: 0 4px 16px rgba(30, 64, 175, 0.25);
          position: relative;
          overflow: hidden;
        }

        .current-user-card::before {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .profile-compact-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          position: relative;
          z-index: 1;
        }

        .profile-compact-info {
          flex: 1;
        }

        .profile-compact-info h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fff;
        }

        .profile-compact-info p {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .mini-ring {
          width: 36px;
          height: 36px;
        }

        .mini-ring .ring-text {
          fill: #fff;
        }

        .mini-ring .ring-bg {
          stroke: rgba(255, 255, 255, 0.25);
        }

        .mini-ring .ring-fill {
          stroke: #fff;
        }

        .section-title {
          font-size: 0.9375rem;
          font-weight: 700;
          margin-top: var(--space-2);
        }

        .team-members-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .member-card {
          transition: transform var(--dur-fast) var(--ease-in-out), box-shadow var(--dur-fast) var(--ease-in-out);
          border: none;
        }

        .member-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }

        .member-card:active {
          transform: scale(0.98);
        }

        .member-card-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .member-list-info h4 {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .member-list-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .member-workload {
          margin-bottom: var(--space-3);
        }

        .workload-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .workload-bar-track {
          width: 100%;
          height: 5px;
          background: var(--bg-elevated);
          border-radius: 3px;
          overflow: hidden;
        }

        .workload-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width var(--dur-slow) var(--ease-out);
        }

        .member-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.6875rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-light);
          padding-top: var(--space-2);
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          min-height: 44px;
          transition: opacity var(--dur-fast) var(--ease-in-out);
        }

        .back-btn:active {
          opacity: 0.7;
        }

        .profile-hero {
          padding: var(--space-6);
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .profile-hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
        }

        .profile-avatar-lg {
          border: 3px solid var(--primary-light);
          box-shadow: 0 2px 12px rgba(30, 64, 175, 0.15);
        }

        .profile-hero-info h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .profile-hero-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .progress-ring-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: var(--space-2);
          width: 72px;
        }

        .progress-ring {
          display: block;
          max-width: 100%;
          max-height: 48px;
        }

        .ring-bg {
          fill: none;
          stroke: var(--border-light);
          stroke-width: 2.8;
        }

        .ring-fill {
          fill: none;
          stroke: var(--primary);
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray var(--dur-slow) var(--ease-out);
        }

        .ring-text {
          fill: var(--text-main);
          font-size: 8px;
          font-weight: 700;
          text-anchor: middle;
        }

        .ring-label {
          font-size: 0.625rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: var(--space-1);
        }

        .settings-section-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-muted);
          margin: var(--space-4) var(--space-2) var(--space-2) 0;
        }

        .settings-list {
          padding: var(--space-2) var(--space-4);
          display: flex;
          flex-direction: column;
        }

        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .settings-item:last-child {
          border-bottom: none;
        }

        .settings-item.clickable {
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-in-out), border-radius var(--dur-fast) var(--ease-in-out);
          margin: 0 calc(var(--space-3) * -1);
          padding-left: var(--space-3);
          padding-right: var(--space-3);
          border-radius: var(--radius-md);
        }

        .settings-item.clickable:hover {
          background-color: var(--bg-elevated);
        }

        .settings-item.clickable:active {
          transform: scale(0.98);
        }

        .settings-item-label {
          font-size: 0.8125rem;
          color: var(--text-main);
        }

        .settings-item-value {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .settings-item-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .chevron-icon {
          color: var(--text-faint);
        }
      `}</style>
    </div>
  );
}
