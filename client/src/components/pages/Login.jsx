import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { forgotPassword, resetPassword } from '../../store/apiClient';

export default function Login() {
  const { login, isLoading, error } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [token, setToken] = useState('');

  // Check for reset token in URL hash on mount / hash change
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const hasResetToken = hash.includes('reset-password') && hash.includes('token=');
      if (hasResetToken) {
        const parts = hash.split('token=');
        if (parts.length > 1) {
          const extractedToken = parts[1].split('&')[0];
          setToken(extractedToken);
          setView('reset');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Handled by store
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const response = await forgotPassword(forgotEmail);
      setForgotSuccess(response.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.message || 'حدث خطأ ما، يرجى المحاولة لاحقاً.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResetError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      const response = await resetPassword(token, newPassword);
      setResetSuccess(response.message || 'تم إعادة تعيين كلمة المرور بنجاح.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        window.location.hash = '#/';
        setView('login');
        setResetSuccess('');
      }, 3000);
    } catch (err) {
      setResetError(err.message || 'حدث خطأ ما، يرجى المحاولة لاحقاً.');
    } finally {
      setResetLoading(false);
    }
  };

  const renderCardContent = () => {
    if (view === 'forgot') {
      return (
        <div className="login-card card">
          <h3>استعادة كلمة المرور</h3>

          {forgotError && <div className="login-error-alert">{forgotError}</div>}
          {forgotSuccess && <div className="login-success-alert">{forgotSuccess}</div>}

          <form onSubmit={handleForgotSubmit}>
            <Input
              type="email"
              placeholder="البريد الإلكتروني المسجل"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={forgotLoading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {forgotLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); setView('login'); setForgotError(''); setForgotSuccess(''); }}
              style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        </div>
      );
    }

    if (view === 'reset') {
      return (
        <div className="login-card card">
          <h3>إعادة تعيين كلمة المرور</h3>

          {resetError && <div className="login-error-alert">{resetError}</div>}
          {resetSuccess && <div className="login-success-alert">{resetSuccess}</div>}

          <form onSubmit={handleResetSubmit}>
            <Input
              type="password"
              placeholder="كلمة المرور الجديدة"
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
              variant="primary"
              disabled={resetLoading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {resetLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; setView('login'); setResetError(''); setResetSuccess(''); }}
              style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="login-card card">
        <h3>تسجيل الدخول للمتابعة</h3>

        {error && (
          <div className="login-error-alert">
            {error}
          </div>
        )}

        <div className="login-hint">
          للأدمن: <strong>admin@mohemmaty.com</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '-4px 0 16px 0' }}>
            <a
              href="#/forgot-password"
              onClick={(e) => { e.preventDefault(); setView('forgot'); }}
              style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600' }}
            >
              نسيت كلمة المرور؟
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <div className="login-view animate-fade-in text-right">
      <div className="login-bg-decor" aria-hidden="true">
        <span className="login-blob login-blob-1" />
        <span className="login-blob login-blob-2" />
      </div>

      <div className="login-logo-container">
        <div className="login-logo-svg-wrapper login-logo-float">
          <svg width="64" height="64" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="18" fill="url(#logoGrad)" />
            <path d="M42 20L25.5 36.5L18 29" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="42" cy="18" r="4" fill="#DBEAFE" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1e40af" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2>مُهِمَّة</h2>
        <p>تطبيق إدارة المهام التفاعلي للفريق</p>
      </div>

      {renderCardContent()}

      <style>{`
        .login-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          padding: 20px;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .login-bg-decor {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: -1;
          pointer-events: none;
        }

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.45;
          animation: blobFloat 14s ease-in-out infinite;
        }

        .login-blob-1 {
          width: 240px;
          height: 240px;
          background: var(--primary-light);
          top: -60px;
          right: -40px;
        }

        .login-blob-2 {
          width: 280px;
          height: 280px;
          background: rgba(59, 130, 246, 0.18);
          bottom: -80px;
          left: -60px;
          animation-delay: -7s;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.08); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }

        .login-logo-float {
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .login-logo-container {
          text-align: center;
        }

        .logo-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 8px;
        }

        .login-logo-container h2 {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--primary);
        }

        .login-logo-container p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .login-card {
          width: 90%;
          padding: 24px 20px;
        }

        .login-card h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 20px;
          text-align: center;
        }

        .login-error-alert {
          background-color: #ffebe6;
          color: #ff3300;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 16px;
          text-align: center;
          border: 1px solid #ffccd0;
        }
        .login-success-alert {
          background-color: #e6ffed;
          color: #047857;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 16px;
          text-align: center;
          border: 1px solid #d1fad7;
        }
        .login-hint {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding: 8px 12px;
          background: rgba(99, 102, 241, 0.06);
          border-radius: 10px;
          border: 1px dashed var(--border);
        }

        .login-divider {
          text-align: center;
          margin: 16px 0;
          position: relative;
        }

        .login-divider::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background-color: var(--border);
          z-index: 1;
        }

        .login-divider span {
          background-color: var(--bg-card);
          padding: 0 10px;
          font-size: 0.75rem;
          color: var(--text-muted);
          position: relative;
          z-index: 2;
        }

        :root {
          --google-btn-bg: #ffffff;
          --google-btn-hover: #f8f9fa;
          --google-btn-border: #dadce0;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --google-btn-bg: #2d2d2d;
            --google-btn-hover: #3a3a3a;
            --google-btn-border: #4a4a4a;
          }
        }

        .google-signin-btn {
          width: 100%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 16px !important;
          margin-top: 4px;
          background-color: var(--google-btn-bg) !important;
          border: 1.5px solid var(--google-btn-border) !important;
          border-radius: 14px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .google-signin-btn:hover:not(:disabled) {
          background-color: var(--google-btn-hover) !important;
          border-color: #c4c7cc !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
        }

        .google-signin-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .google-signin-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: #fff;
          border-radius: 4px;
          padding: 1px;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .google-icon-wrapper {
            background: #fff;
          }
        }

        .google-btn-text {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
      `}</style>
    </div>
  );
}
