import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Avatar from '../atoms/Avatar';
import { X, Lock, Camera, Save, ChevronLeft } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function ProfileModal({ isOpen, onClose, isDarkMode, toggleDarkMode, fullscreen, toggleFullscreen, simulateMobile, toggleSimulateMobile }) {
  const currentUser = useAppStore(s => s.currentUser);
  const updateCurrentUserProfile = useAppStore(s => s.updateCurrentUserProfile);
  const changeCurrentUserPassword = useAppStore(s => s.changeCurrentUserPassword);
  const logout = useAppStore(s => s.logout);
  
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateCurrentUserProfile({ name, avatar });
      onClose();
    } catch (err) {
      // Toast handles error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setIsSubmitting(true);
    setPasswordError('');
    try {
      await changeCurrentUserPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (err) {
      setPasswordError(err.message || 'فشل تغيير كلمة المرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content profile-modal text-right" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>الملف الشخصي والإعدادات</h3>
          <button className="close-btn" onClick={onClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 'var(--space-4)', maxHeight: '78vh', overflowY: 'auto' }}>
          <div className="profile-preview-section">
            <div className="profile-avatar-wrapper">
              <Avatar src={avatar} alt={name} size="lg" />
              <div className="avatar-edit-badge" title="رابط الصورة الشخصية">
                <Camera size={14} />
              </div>
            </div>
            <h4 className="profile-name">{currentUser.name}</h4>
            <span className="profile-role">{currentUser.role || 'عضو الفريق'}</span>
            <span className="profile-email font-english">{currentUser.email}</span>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form">
            <Input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="url"
              placeholder="رابط الصورة الشخصية (Avatar)"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={14} />
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </form>

          {/* App Settings Section */}
          <div className="settings-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>إعدادات التطبيق</h4>
            
            <div 
              className="settings-item-row" 
              onClick={() => { triggerHaptic('light'); toggleDarkMode(); }} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>الوضع الداكن 🌙</span>
              <div className={`toggle-switch ${isDarkMode ? 'active' : ''}`} style={{ pointerEvents: 'none' }}>
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div 
              className="settings-item-row" 
              onClick={() => { triggerHaptic('light'); toggleFullscreen(); }} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>وضع ملء الشاشة 🖥️</span>
              <div className={`toggle-switch ${fullscreen ? 'active' : ''}`} style={{ pointerEvents: 'none' }}>
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div 
              className="settings-item-row" 
              onClick={() => { triggerHaptic('light'); toggleSimulateMobile(); }} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>العرض كمظهر الهاتف 📱</span>
              <div className={`toggle-switch ${simulateMobile ? 'active' : ''}`} style={{ pointerEvents: 'none' }}>
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div 
              className="settings-item-row" 
              onClick={() => { triggerHaptic('error'); logout(); onClose(); }} 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer', color: 'var(--danger)' }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>تسجيل الخروج 🚪</span>
              <ChevronLeft size={16} style={{ color: 'var(--danger)' }} />
            </div>
          </div>

          <div className="password-section" style={{ marginTop: 'var(--space-4)' }}>
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              aria-expanded={showPasswordChange}
            >
              <Lock size={14} />
              <span>{showPasswordChange ? 'إلغاء' : 'تغيير كلمة المرور'}</span>
            </button>

            {showPasswordChange && (
              <form onSubmit={handleChangePasswordSubmit} className="password-form animate-fade-in">
                {passwordError && <div className="password-error">{passwordError}</div>}
                
                <Input
                  type="password"
                  placeholder="كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <Input
                  type="password"
                  placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <Input
                  type="password"
                  placeholder="تأكيد كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-modal {
          max-width: 380px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }

        .profile-preview-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: var(--space-4);
        }

        .profile-avatar-wrapper {
          position: relative;
          margin-bottom: var(--space-3);
          cursor: pointer;
        }

        .avatar-edit-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
        }

        .profile-name {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .profile-role {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 600;
          margin-top: 2px;
        }

        .profile-email {
          font-size: 0.6875rem;
          color: var(--text-faint);
          margin-top: 2px;
        }

        .profile-form {
          margin-bottom: var(--space-4);
        }

        .password-section {
          border-top: 1px solid var(--border-light);
          padding-top: var(--space-4);
        }

        .password-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--bg-elevated);
          color: var(--primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease-in-out);
          min-height: 44px;
        }

        .password-toggle-btn:hover {
          background: var(--primary-light);
        }

        .password-form {
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .password-error {
          background-color: var(--danger-light);
          color: var(--danger);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          border-right: 3px solid var(--danger);
        }
      `}</style>
    </div>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  toggleFullscreen: PropTypes.func.isRequired,
  simulateMobile: PropTypes.bool.isRequired,
  toggleSimulateMobile: PropTypes.func.isRequired
};
