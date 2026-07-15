import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

export default function AdminDashboard() {
  const {
    adminMembers,
    adminSettings,
    loadAdminMembers,
    updateMemberDetails,
    deleteMember,
    loadAdminSettings,
    saveAdminSettings,
    currentUser
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'settings'
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: '', avatar: '' });
  const [editError, setEditError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    allowUserRegistration: true,
    maintenanceMode: false,
    maxTasksPerUser: 10
  });

  useEffect(() => {
    loadAdminMembers();
    loadAdminSettings();
  }, []);

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

  const roles = [
    'الادمن المطور',
    'مديرة المنتج',
    'مطور باك-إند',
    'مطور فرونت-إند',
    'مصمم واجهات UI/UX',
    'محلل بيانات',
    'مهندس جودة برمجيات'
  ];

  return (
    <div className="admin-dashboard-container animate-fade-in text-right">
      <div className="admin-header">
        <h1>لوحة الإدارة الشاملة ⚙️</h1>
        <p>مرحباً بك في وحدة التحكم الإدارية الفائقة بالنظام.</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 إدارة حسابات الأعضاء
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          🔧 إعدادات التطبيق العامة
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="admin-tab-content card-glass">
          <div className="section-title-container">
            <h2>قائمة مستخدمي التطبيق ({adminMembers.length})</h2>
          </div>

          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>العضو</th>
                  <th>البريد الإلكتروني</th>
                  <th>الدور الوظيفي</th>
                  <th>تاريخ التسجيل</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {adminMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-info-cell">
                        <img src={member.avatar || 'https://ui-avatars.com/api/?name=User'} alt={member.name} className="member-avatar-img" />
                        <span className="member-name-text">{member.name}</span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`role-badge ${member.role === 'الادمن المطور' ? 'super' : member.role === 'مديرة المنتج' ? 'manager' : ''}`}>
                        {member.role || 'عضو عادي'}
                      </span>
                    </td>
                    <td>{new Date(member.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <div className="actions-cell">
                        <Button variant="secondary" size="sm" onClick={() => handleEditClick(member)}>
                          تعديل 📝
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={member.id === currentUser.id}
                          onClick={() => handleDeleteClick(member.id)}
                        >
                          حذف 🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-tab-content card-glass">
          <div className="section-title-container">
            <h2>إعدادات النظام العامة</h2>
          </div>

          <form onSubmit={handleSettingsSubmit} className="admin-settings-form">
            <div className="settings-group">
              <label className="toggle-label">
                <span className="label-title">السماح بتسجيل الحسابات الجديدة:</span>
                <span className="label-desc">تمكين الأعضاء من إنشاء حسابات ذاتية من الخارج.</span>
                <input
                  type="checkbox"
                  checked={settingsForm.allowUserRegistration}
                  onChange={(e) => setSettingsForm({ ...settingsForm, allowUserRegistration: e.target.checked })}
                  className="settings-checkbox"
                />
              </label>
            </div>

            <div className="settings-group">
              <label className="toggle-label warning-toggle">
                <span className="label-title">تفعيل وضع الصيانة ⚠️:</span>
                <span className="label-desc">حظر دخول المستخدمين العاديين والمدراء والسماح للأدمن المطور فقط.</span>
                <input
                  type="checkbox"
                  checked={settingsForm.maintenanceMode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                  className="settings-checkbox"
                />
              </label>
            </div>

            <div className="settings-group">
              <span className="label-title">الحد الأقصى للمهام المفتوحة لكل عضو:</span>
              <span className="label-desc">الحد الأقصى لعدد المهام غير المكتملة التي يمكن إسنادها لعضو واحد في نفس الوقت.</span>
              <Input
                type="number"
                value={settingsForm.maxTasksPerUser}
                onChange={(e) => setSettingsForm({ ...settingsForm, maxTasksPerUser: e.target.value })}
                min="1"
                required
                style={{ maxWidth: '150px', marginTop: '10px' }}
              />
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '20px' }}>
              {isSubmitting ? 'جاري حفظ الإعدادات...' : 'حفظ الإعدادات 💾'}
            </Button>
          </form>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="modal-backdrop">
          <div className="modal-content card-glass">
            <div className="modal-header">
              <h3>تعديل بيانات العضو: {editingMember.name}</h3>
            </div>
            {editError && <div className="error-message alert-red">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="modal-form">
              <Input
                label="الاسم الكامل"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              <Input
                label="رابط الصورة الرمزية (Avatar URL)"
                value={editForm.avatar}
                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              />
              <div className="input-group">
                <label className="input-label">الدور الوظيفي</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="role-select"
                  required
                >
                  <option value="">اختر دوراً...</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <Input
                label="كلمة مرور جديدة (اتركه فارغاً لعدم التغيير)"
                type="password"
                value={editForm.password}
                placeholder="تحديث كلمة المرور"
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />

              <div className="modal-actions">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري التعديل...' : 'حفظ التعديلات'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditingMember(null)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-header h1 {
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          color: #f3f4f6;
          margin-bottom: 8px;
        }
        .admin-header p {
          color: #9ca3af;
        }
        .admin-tabs {
          display: flex;
          gap: 16px;
          margin: 24px 0;
          border-bottom: 1.5px dashed #4b5563;
          padding-bottom: 12px;
        }
        .admin-tab-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-family: 'IBM Plex Sans Arabic', sans-serif;
        }
        .admin-tab-btn:hover {
          color: #f3f4f6;
          background: rgba(255, 255, 255, 0.05);
        }
        .admin-tab-btn.active {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        .card-glass {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
        }
        .members-table-wrapper {
          overflow-x: auto;
          margin-top: 16px;
        }
        .members-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
        }
        .members-table th, .members-table td {
          padding: 14px 16px;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.05);
        }
        .members-table th {
          color: #9ca3af;
          font-weight: 500;
        }
        .member-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .member-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
        }
        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.05);
          color: #d1d5db;
        }
        .role-badge.super {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .role-badge.manager {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        .admin-settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .settings-group {
          padding-bottom: 16px;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.05);
        }
        .toggle-label {
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
        }
        .label-title {
          font-size: 16px;
          font-weight: 600;
          color: #f3f4f6;
        }
        .label-desc {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .settings-checkbox {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 24px;
          cursor: pointer;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
        }
        .modal-header h3 {
          margin-bottom: 16px;
          font-family: 'IBM Plex Sans Arabic', sans-serif;
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .role-select {
          width: 100%;
          background: #1f2937;
          border: 1.5px solid #374151;
          color: #f3f4f6;
          border-radius: 8px;
          padding: 10px;
          font-family: 'IBM Plex Sans Arabic', sans-serif;
          margin-top: 6px;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .error-message {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
