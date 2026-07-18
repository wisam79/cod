import React from 'react';
import { Bell } from 'lucide-react';
import Avatar from '../atoms/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { triggerHaptic } from '../../utils/haptics';

const TAB_TITLES = {
  dashboard: 'لوحة التحكم',
  tasks: 'قائمة المهام',
  chat: 'المحادثة الجماعية',
  team: 'أعضاء الفريق',
  admin: 'إعدادات الإدارة'
};

export default function HeaderBar({ activeTab, user, onOpenNotifications, onOpenProfile }) {
  const notifications = useAppStore(s => s.notifications);

  return (
    <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      {activeTab === 'dashboard' ? (
        <div className="header-welcome-container" onClick={() => { onOpenProfile(); triggerHaptic('light'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Avatar src={user.avatar} alt={user.name} size="md" className="avatar" />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              أهلاً، {user.name.split(' ')[0]} 👋
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user.email || user.role || 'عضو متصل'}
            </span>
          </div>
        </div>
      ) : (
        <div className="header-user" onClick={() => { onOpenProfile(); triggerHaptic('light'); }} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label="تعديل الملف الشخصي">
          <Avatar src={user.avatar} alt={user.name} size="md" className="avatar" />
        </div>
      )}

      {activeTab !== 'dashboard' && (
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          {TAB_TITLES[activeTab] || 'مُهِمَّة'}
        </h2>
      )}

      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={() => { onOpenNotifications(); triggerHaptic('light'); }}
          aria-label="مركز التنبيهات"
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="badge-count" aria-label={`${notifications.length} إشعار جديد`}>{notifications.length}</span>
          )}
        </button>
      </div>
    </div>
  );
}
