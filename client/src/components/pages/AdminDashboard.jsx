import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Avatar from '../atoms/Avatar';
import { triggerHaptic } from '../../utils/haptics';
import { Settings, Users, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const adminMembers = useAppStore(s => s.adminMembers);
  const adminSettings = useAppStore(s => s.adminSettings);
  const loadAdminMembers = useAppStore(s => s.loadAdminMembers);
  const addMember = useAppStore(s => s.addMember);
  const updateMemberDetails = useAppStore(s => s.updateMemberDetails);
  const deleteMember = useAppStore(s => s.deleteMember);
  const loadAdminSettings = useAppStore(s => s.loadAdminSettings);
  const saveAdminSettings = useAppStore(s => s.saveAdminSettings);
  const currentUser = useAppStore(s => s.currentUser);

  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'settings'
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: '', avatar: '' });
  const [editError, setEditError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Member State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'عضو عادي', avatar: '' });
  const [addError, setAddError] = useState('');

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    allowUserRegistration: true,
    maintenanceMode: false,
    maxTasksPerUser: 10
  });

  useEffect(() => {
    loadAdminMembers();
    loadAdminSettings();
  }, [loadAdminMembers, loadAdminSettings]);

  useEffect(() => {
    if (adminSettings) {
      setSettingsForm({
        allowUserRegistration: adminSettings.allowUserRegistration,
        maintenanceMode: adminSettings.maintenanceMode,
        maxTasksPerUser: adminSettings.maxTasksPerUser
      });
    }
  }, [adminSettings]);

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role || '',
      avatar: member.avatar || ''
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsSubmitting(true);
    try {
      await updateMemberDetails(editingMember.id, {
        name: editForm.name,
        email: editForm.email,
        password: editForm.password !== '' ? editForm.password : undefined,
        role: editForm.role,
        avatar: editForm.avatar
      });
      setEditingMember(null);
    } catch (err) {
      setEditError(err.message || 'حدث خطأ أثناء تعديل بيانات العضو.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (memberId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العضو؟ سيتم سحب المهام المسندة إليه وإلغاء تعليقاته.')) {
      try {
        await deleteMember(memberId);
      } catch (_) {
      }
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveAdminSettings({
        allowUserRegistration: settingsForm.allowUserRegistration,
        maintenanceMode: settingsForm.maintenanceMode,
        maxTasksPerUser: parseInt(settingsForm.maxTasksPerUser, 10)
      });
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);
    try {
      await addMember({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
        avatar: addForm.avatar
      });
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', role: 'عضو عادي', avatar: '' });
    } catch (err) {
      setAddError(err.message || 'حدث خطأ أثناء إضافة العضو.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    'الادمن المطور',
    'مديرة المنتج',
    'مطور باك-إند',
    'مطور فرونت-إند',
    'مصمم واجهات UI/UX'
  ];

  return (
    <div className="admin-dashboard-container animate-fade-in text-right">
      <div className="admin-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Settings size={22} style={{ animation: 'spin 12s linear infinite' }} />
          <span>لوحة الإدارة الشاملة</span>
        </h1>
        <p>وحدة التحكم الإدارية الفائقة بالنظام.</p>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => { triggerHaptic('light'); setActiveTab('members'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          <Users size={16} />
          <span>الحسابات</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { triggerHaptic('light'); setActiveTab('settings'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          <Settings size={16} />
          <span>الإعدادات</span>
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="admin-tab-content">
          <div className="section-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ margin: 0 }}>أعضاء النظام ({adminMembers.length})</h2>
            <Button variant="primary" size="sm" onClick={() => { triggerHaptic('light'); setShowAddModal(true); }} style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>إضافة عضو جديد</span>
            </Button>
          </div>

          <div className="members-card-list">
            {adminMembers.map((member) => (
              <div key={member.id} className="admin-member-card card">
                <div className="admin-member-header">
                  <Avatar src={member.avatar} alt={member.name} size="md" />
                  <div className="admin-member-info">
                    <h4>{member.name}</h4>
                    <span className="admin-member-email font-english" style={{ fontSize: '0.75rem', fontWeight: 600 }}>@{member.email}</span>
                  </div>
                </div>
                
                <div className="admin-member-body">
                  <span className={`role-badge ${member.role === 'الادمن المطور' ? 'super' : member.role === 'مديرة المنتج' ? 'manager' : ''}`}>
                    {member.role || 'عضو عادي'}
                  </span>
                  <span className="join-date font-english">{new Date(member.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>

                <div className="admin-member-actions" style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="secondary" size="sm" onClick={() => { triggerHaptic('light'); handleEditClick(member); }} style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pencil size={14} />
                    <span>تعديل</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={member.id === currentUser?.id}
                    onClick={() => { triggerHaptic('error'); handleDeleteClick(member.id); }}
                    style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    <span>حذف</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-tab-content">
          <form onSubmit={handleSettingsSubmit} className="admin-settings-form card">
            <div className="settings-group">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="label-title">التسجيل المفتوح:</span>
                  <span className="label-desc">تمكين إنشاء حسابات جديدة من الخارج.</span>
                </div>
                <div
                  className={`toggle-switch ${settingsForm.allowUserRegistration ? 'active' : ''}`}
                  onClick={() => { triggerHaptic('light'); setSettingsForm({ ...settingsForm, allowUserRegistration: !settingsForm.allowUserRegistration }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerHaptic('light'); setSettingsForm({ ...settingsForm, allowUserRegistration: !settingsForm.allowUserRegistration }); } }}
                  role="switch"
                  aria-checked={settingsForm.allowUserRegistration}
                  tabIndex={0}
                >
                  <div className="toggle-switch-knob" />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="label-title">وضع الصيانة ⚠️:</span>
                  <span className="label-desc">حظر دخول المستخدمين باستثناء الأدمن المطور.</span>
                </div>
                <div
                  className={`toggle-switch ${settingsForm.maintenanceMode ? 'active' : ''}`}
                  onClick={() => { triggerHaptic('light'); setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerHaptic('light'); setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode }); } }}
                  role="switch"
                  aria-checked={settingsForm.maintenanceMode}
                  tabIndex={0}
                >
                  <div className="toggle-switch-knob" />
                </div>
              </div>
            </div>

            <div className="settings-group" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className="label-title">الحد الأقصى للمهام لكل عضو:</span>
              <span className="label-desc">المهام المفتوحة التي يمكن إسنادها لعضو واحد.</span>
              <Input
                type="number"
                value={settingsForm.maxTasksPerUser}
                onChange={(e) => setSettingsForm({ ...settingsForm, maxTasksPerUser: e.target.value })}
                min="1"
                required
                style={{ maxWidth: '120px', marginTop: '10px' }}
              />
            </div>

             <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <Settings size={16} style={{ animation: isSubmitting ? 'spin 2s linear infinite' : 'none' }} />
               <span>{isSubmitting ? 'جاري حفظ الإعدادات...' : 'حفظ الإعدادات'}</span>
             </Button>
          </form>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ width: '92%', maxWidth: '380px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>إضافة عضو جديد</h3>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
              {addError && <div className="error-message alert-red">{addError}</div>}
              <Input
                label="الاسم الكامل"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
              <Input
                label="اسم المستخدم (5 حروف)"
                type="text"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                maxLength={5}
                required
              />
              <Input
                label="رمز الدخول PIN (6 أرقام)"
                type="password"
                value={addForm.password}
                placeholder="أدخل 6 أرقام"
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                maxLength={6}
                required
              />
              <Input
                label="رابط الصورة الرمزية (Avatar URL)"
                value={addForm.avatar}
                onChange={(e) => setAddForm({ ...addForm, avatar: e.target.value })}
              />
              
              <div className="custom-input-wrapper">
                <label className="custom-input-label">الدور الوظيفي</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    height: 'var(--tap-target)',
                    outline: 'none'
                  }}
                  required
                >
                  <option value="">اختر دوراً...</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <Button type="submit" variant="primary" disabled={isSubmitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Plus size={14} />
                  <span>إضافة العضو</span>
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="modal-backdrop" onClick={() => setEditingMember(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ width: '92%', maxWidth: '380px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>تعديل: {editingMember.name}</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              {editError && <div className="error-message alert-red">{editError}</div>}
              <Input
                label="الاسم الكامل"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <Input
                label="اسم المستخدم (5 حروف)"
                type="text"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                maxLength={5}
                required
              />
              <Input
                label="رابط الصورة الرمزية (Avatar URL)"
                value={editForm.avatar}
                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              />
              
              <div className="custom-input-wrapper">
                <label className="custom-input-label">الدور الوظيفي</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    height: 'var(--tap-target)',
                    outline: 'none'
                  }}
                  required
                >
                  <option value="">اختر دوراً...</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <Input
                label="رمز دخول PIN جديد (اختياري)"
                type="password"
                value={editForm.password}
                placeholder="تحديث رمز الدخول"
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                maxLength={6}
              />

              <div className="modal-actions" style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <Button type="submit" variant="primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  حفظ
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditingMember(null)} style={{ flex: 1 }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .admin-header h1 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .admin-header p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .admin-tabs {
          display: flex;
          gap: var(--space-2);
          background: var(--bg-elevated);
          padding: 3px;
          border-radius: var(--radius-md);
        }
        .admin-tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          padding: var(--space-2) var(--space-1);
          border-radius: var(--radius-sm);
          transition: all var(--dur-fast) var(--ease-in-out);
          min-height: 36px;
        }
        .admin-tab-btn.active {
          background: var(--bg-card);
          color: var(--text-main);
          font-weight: 700;
          box-shadow: var(--shadow-xs);
        }
        .admin-tab-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .section-title-container h2 {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .members-card-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding-bottom: 80px;
        }
        .admin-member-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        .admin-member-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .admin-member-info h4 {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .admin-member-email {
          font-size: 0.75rem;
          color: var(--text-faint);
        }
        .admin-member-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          padding: var(--space-2) 0;
        }
        .join-date {
          font-size: 0.6875rem;
          color: var(--text-faint);
        }
        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--bg-elevated);
          color: var(--text-muted);
        }
        .role-badge.super {
          background: var(--danger-light);
          color: var(--danger);
        }
        .role-badge.manager {
          background: var(--warning-light);
          color: var(--warning);
        }
        .admin-member-actions {
          display: flex;
          gap: var(--space-2);
        }
        .admin-member-actions button {
          flex: 1;
        }
        .admin-settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-5);
        }
        .settings-group {
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .label-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
          display: block;
        }
        .label-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
          display: block;
        }
        .error-message {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          background-color: var(--danger-light);
          color: var(--danger);
          border-right: 3px solid var(--danger);
        }
      `}</style>
    </div>
  );
}
