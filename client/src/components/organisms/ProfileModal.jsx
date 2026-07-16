import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Avatar from '../atoms/Avatar';
import { X, Lock, Camera, Save } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateCurrentUserProfile, changeCurrentUserPassword } = useAppStore();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
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
          <h3 className="modal-title">الملف الشخصي</h3>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-preview-section">
            <div className="profile-avatar-wrapper">
              <Avatar src={avatar} alt={name} size="lg" />
              <div className="avatar-edit-overlay" title="رابط الصورة الشخصية">
                <Camera size={16} />
              </div>
            </div>
            <h4 className="profile-preview-name">{currentUser.name}</h4>
            <span className="profile-preview-role">{currentUser.role || 'عضو الفريق'}</span>
            <span className="profile-preview-email">{currentUser.email}</span>
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
              <Save size={16} />
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </form>

          <div className="password-accordion">
            <button 
              type="button" 
              className="accordion-trigger" 
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              aria-expanded={showPasswordChange}
            >
              <Lock size={16} />
              <span>{showPasswordChange ? 'إلغاء تغيير كلمة المرور' : 'تغيير كلمة المرور'}</span>
            </button>

            {showPasswordChange && (
              <form onSubmit={handleChangePasswordSubmit} className="password-form animate-fade-in">
                {passwordError && <div className="password-error-alert">{passwordError}</div>}
                
                <Input
                  type="password"
                  placeholder="كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  placeholder="تأكيد كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
          max-width: 400px;
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
        }

        .profile-preview-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .profile-avatar-wrapper {
          position: relative;
          margin-bottom: 12px;
          cursor: pointer;
        }

        .avatar-edit-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .profile-preview-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .profile-preview-role {
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 700;
          margin-top: 2px;
        }

        .profile-preview-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .profile-form {
          margin-bottom: 20px;
        }

        .password-accordion {
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(30, 64, 175, 0.05);
          color: var(--primary);
          border: 1px solid rgba(30, 64, 175, 0.15);
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .accordion-trigger:hover {
          background: rgba(30, 64, 175, 0.1);
        }

        .password-form {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .password-error-alert {
          background-color: #ffebe6;
          color: #ff3300;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          border: 1px solid #ffccd0;
        }
      `}</style>
    </div>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
