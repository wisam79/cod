import React from 'react';
import { Home, MessageSquare, Users, ShieldAlert, Settings, CheckSquare } from 'lucide-react';
import Avatar from '../atoms/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { triggerHaptic } from '../../utils/haptics';

const isSuperAdminRole = (role) => role && (role.includes('الادمن المطور') || role.includes('Super Admin'));

export default function DesktopSidebar({ activeTab, handleSetActiveTab, user, wsStatus, onOpenProfile }) {
  const currentUser = useAppStore(s => s.currentUser);
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CheckSquare size={22} style={{ color: '#fff' }} />
        </div>
        <div className="logo-text">
          <h2>مُهِمَّة</h2>
          <span className="logo-sub font-english">Mohemmaty</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <button className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleSetActiveTab('dashboard')}>
          <Home size={18} />
          <span>لوحة التحكم</span>
        </button>
        <button className={`sidebar-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => handleSetActiveTab('tasks')}>
          <CheckSquare size={18} />
          <span>إدارة المهام</span>
        </button>
        <button className={`sidebar-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleSetActiveTab('chat')}>
          <MessageSquare size={18} />
          <span>غرفة المحادثة</span>
        </button>
        <button className={`sidebar-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => handleSetActiveTab('team')}>
          <Users size={18} />
          <span>دليل الفريق</span>
        </button>
        {isSuperAdmin && (
          <button className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleSetActiveTab('admin')}>
            <ShieldAlert size={18} />
            <span>لوحة الإدارة</span>
          </button>
        )}
        <button className="sidebar-item settings-btn" onClick={() => { onOpenProfile(); triggerHaptic('light'); }}>
          <Settings size={18} />
          <span>الإعدادات</span>
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user-info" onClick={() => { onOpenProfile(); triggerHaptic('light'); }} style={{ cursor: 'pointer' }}>
          <Avatar src={user.avatar} alt={user.name} size="sm" />
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        </div>
        <div className="sidebar-status">
          <span className={`ws-indicator-dot ${wsStatus}`}></span>
          <span>جودة الاتصال: {wsStatus === 'connected' ? 'ممتاز' : 'مفصول'}</span>
        </div>
        <span className="version font-english">الإصدار 1.0.0</span>
      </div>
    </aside>
  );
}
