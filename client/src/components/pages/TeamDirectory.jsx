import { ArrowRight, ChevronLeft, Mail, Phone, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../atoms/Avatar';

export default function TeamDirectory() {
  const { members, tasks, currentUser } = useAppStore();
  const [selectedMember, setSelectedMember] = useState(null);

  // Helper to count tasks for a member
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

  // If viewing a member's full profile (mockup Screen 3 style)
  if (selectedMember) {
    return (
      <div className="member-profile-view animate-fade-in text-right">
        {/* Back button */}
        <button className="back-profile-btn" onClick={() => setSelectedMember(null)}>
          <ArrowRight size={16} className="back-arrow" /> العودة إلى قائمة الفريق
        </button>

        {/* Profile Card */}
        <div className="profile-hero-card card">
          <div className="profile-header">
            <Avatar src={selectedMember.avatar} alt={selectedMember.name} size="lg" className="profile-avatar-large" />
            <div className="profile-title-info">
              <h3>{selectedMember.name}</h3>
              <p>{selectedMember.role}</p>
            </div>
            
            {/* progress circle */}
            <div className="circular-progress-wrapper">
              <svg viewBox="0 0 36 36" className="circular-chart orange">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${selectedMember.progressPercent}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{selectedMember.progressPercent}%</text>
              </svg>
              <span className="circle-label">إنجاز المهام</span>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <h4 className="settings-section-title">بيانات العمل</h4>
        <div className="settings-list card">
          <div className="settings-item">
            <span className="settings-item-label">المهام النشطة حالياً</span>
            <span className="settings-item-value font-english highlight-value">{selectedMember.active} مهام</span>
          </div>
          <div className="settings-item">
            <span className="settings-item-label">المهام المكتملة</span>
            <span className="settings-item-value font-english">{selectedMember.completed} مهام</span>
          </div>
          <div className="settings-item">
            <span className="settings-item-label">الدور الوظيفي في الفريق</span>
            <span className="settings-item-value">{selectedMember.role}</span>
          </div>
        </div>

        {/* General Section */}
        <h4 className="settings-section-title">إجراءات التواصل</h4>
        <div className="settings-list card">
          <div className="settings-item clickable">
            <div className="settings-item-left">
              <Mail size={16} style={{ verticalAlign: 'middle', marginLeft: '8px', color: 'var(--primary)' }} />
              <span>إرسال بريد إلكتروني</span>
            </div>
            <ChevronLeft size={14} className="arrow-right" />
          </div>
          <div className="settings-item clickable">
            <div className="settings-item-left">
              <Phone size={16} style={{ verticalAlign: 'middle', marginLeft: '8px', color: 'var(--primary)' }} />
              <span>اتصال هاتفي مباشر</span>
            </div>
            <ChevronLeft size={14} className="arrow-right" />
          </div>
          <div className="settings-item clickable">
            <div className="settings-item-left">
              <MessageSquare size={16} style={{ verticalAlign: 'middle', marginLeft: '8px', color: 'var(--primary)' }} />
              <span>إرسال رسالة خاصة (تواصل فرعي)</span>
            </div>
            <ChevronLeft size={14} className="arrow-right" />
          </div>
        </div>
      </div>
    );
  }

  // Active User Stat (J. Jacob style header)
  const currentUserStats = getMemberTaskStats(user.id);

  return (
    <div className="team-directory-view animate-fade-in text-right">
      {/* Current Logged In User Profile Banner (Inspired by Screen 3 Profile card) */}
      <div className="current-user-card card clickable" onClick={() => handleMemberClick(user)}>
        <div className="profile-compact-header">
          <Avatar src={user.avatar} alt={user.name} size="md" className="profile-avatar-compact" />
          <div className="profile-compact-info">
            <h3>{user.name} (أنت)</h3>
            <p>{user.role}</p>
          </div>
          <div className="mini-ring-progress">
            <svg viewBox="0 0 36 36" className="circular-chart orange">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" strokeDasharray={`${currentUserStats.progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" className="percentage">{currentUserStats.progressPercent}%</text>
            </svg>
          </div>
        </div>
        <div className="card-tap-hint">اضغط لعرض ملفك الشخصي بالكامل ➔</div>
      </div>

      <h3 className="section-title">أعضاء الفريق العملي ({members.length})</h3>

      {/* Members List */}
      <div className="team-members-list">
        {members.map(member => {
          const stats = getMemberTaskStats(member.id);
          return (
            <div key={member.id} className="member-card card animate-slide-up" onClick={() => handleMemberClick(member)}>
              <div className="member-card-content">
                <Avatar src={member.avatar} alt={member.name} size="md" className="member-list-avatar" />
                <div className="member-list-info">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>

              {/* Workload Progress Bar */}
              <div className="member-workload">
                <div className="workload-text">
                  <span>عبء العمل الحالي:</span>
                  <span className="font-english">{stats.active} مهام جارية</span>
                </div>
                <div className="workload-bar-container">
                  <div 
                    className="workload-bar-fill" 
                    style={{ 
                      width: `${Math.min((stats.active / 5) * 100, 100)}%`,
                      backgroundColor: stats.active > 3 ? 'var(--priority-high)' : stats.active > 1 ? 'var(--priority-medium)' : 'var(--priority-low)'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="member-card-footer font-english">
                <span>مكتملة: {stats.completed}</span>
                <span>نسبة الإنجاز: {stats.progressPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .team-directory-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .text-right {
          text-align: right;
        }

        /* Current logged in user card styling */
        .current-user-card {
          border-left: 4px solid var(--primary);
          padding: 16px;
        }

        .profile-compact-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-compact-info {
          flex: 1;
        }

        .profile-compact-info h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .profile-compact-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .mini-ring-progress {
          width: 36px;
          height: 36px;
        }

        .card-tap-hint {
          font-size: 0.7rem;
          color: var(--primary);
          font-weight: 700;
          margin-top: 10px;
          border-top: 1px dashed var(--border);
          padding-top: 6px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 800;
          margin-top: 8px;
        }

        .team-members-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .member-card {
          cursor: pointer;
        }

        .member-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .member-card-content {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .member-workload {
          margin-bottom: 10px;
        }

        .workload-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 4px;
        }

        .workload-bar-container {
          width: 100%;
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        .workload-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .member-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 8px;
        }

        /* MEMBER PROFILE VIEW */
        .back-profile-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          transition: transform 0.2s;
        }

        .back-profile-btn:active {
          transform: translateX(3px);
        }

        .profile-hero-card {
          padding: 24px;
          text-align: center;
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .profile-avatar-large {
          border: 3px solid var(--primary-light);
          box-shadow: var(--shadow-sm);
        }

        .profile-title-info h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .profile-title-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Circular progress chart style */
        .circular-progress-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 8px;
          width: 80px;
        }

        .circular-chart {
          display: block;
          max-width: 100%;
          max-height: 52px;
        }

        .circle-bg {
          fill: none;
          stroke: var(--border);
          stroke-width: 2.8;
        }

        .circle {
          fill: none;
          stroke: var(--primary);
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 0.3s ease;
        }

        .percentage {
          fill: var(--text-main);
          font-family: var(--font-english);
          font-size: 8px;
          font-weight: 800;
          text-anchor: middle;
        }

        .circle-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 4px;
        }

        .settings-section-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
          margin: 16px 8px 8px 0;
        }

        .settings-list {
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
        }

        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .settings-item:last-child {
          border-bottom: none;
        }

        .settings-item.clickable {
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .settings-item.clickable:active {
          opacity: 0.6;
        }

        .settings-item-label {
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .settings-item-value {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .highlight-value {
          color: var(--primary);
          font-weight: 700;
        }

        .settings-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .arrow-right {
          font-size: 0.6rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
