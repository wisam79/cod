import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import { forgotPassword, resetPassword } from '../../store/apiClient';

export default function Login() {
  const login = useAppStore(s => s.login);
  const isLoading = useAppStore(s => s.authLoading);
  const error = useAppStore(s => s.authError);
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

          {forgotError && <div className="login-alert login-alert-error">{forgotError}</div>}
          {forgotSuccess && <div className="login-alert login-alert-success">{forgotSuccess}</div>}

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
              style={{ width: '100%', marginTop: '8px' }}
            >
              {forgotLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>

          <div className="login-back-link">
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); setView('login'); setForgotError(''); setForgotSuccess(''); }}
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

          {resetError && <div className="login-alert login-alert-error">{resetError}</div>}
          {resetSuccess && <div className="login-alert login-alert-success">{resetSuccess}</div>}

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
              style={{ width: '100%', marginTop: '8px' }}
            >
              {resetLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
            </Button>
          </form>

          <div className="login-back-link">
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; setView('login'); setResetError(''); setResetSuccess(''); }}
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="login-card card">
        <h3>تسجيل الدخول</h3>

        {error && (
          <div className="login-alert login-alert-error">
            {error}
          </div>
        )}

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

          <div className="login-forgot-link">
            <a
              href="#/forgot-password"
              onClick={(e) => { e.preventDefault(); setView('forgot'); }}
            >
              نسيت كلمة المرور؟
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </Button>
        </form>


      </div>
    );
  };

  return (
    <div className="login-view animate-fade-in text-right">
      <div className="login-logo-container">
        <div className="login-logo-icon">
          <svg width="56" height="56" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="14" fill="var(--primary)" />
            <path d="M42 20L25.5 36.5L18 29" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>مُهِمَّة</h2>
        <p>تسجيل الدخول للمتابعة</p>
      </div>

      {renderCardContent()}

      <style>{`
        .login-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          padding: var(--space-5);
          gap: var(--space-6);
          position: relative;
          background: radial-gradient(ellipse at top, rgba(30, 64, 175, 0.06) 0%, transparent 60%);
        }

        .login-logo-container {
          text-align: center;
        }

        .login-logo-icon {
          margin-bottom: var(--space-3);
          display: inline-flex;
          filter: drop-shadow(0 4px 12px rgba(30, 64, 175, 0.25));
        }

        .login-logo-container h2 {
          font-size: 1.375rem;
          font-weight: 900;
          color: var(--text-main);
          margin-bottom: var(--space-1);
        }

        .login-logo-container p {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .login-card {
          width: 92%;
          max-width: 380px;
          padding: var(--space-7) var(--space-6);
          box-shadow: var(--shadow-lg);
          border-radius: var(--radius-xl);
        }

        .login-card h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: var(--space-5);
          text-align: center;
        }

        .login-alert {
          padding: var(--space-3);
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: var(--space-4);
          text-align: center;
          border-right: 3px solid;
        }

        .login-alert-error {
          background-color: var(--danger-light);
          color: var(--danger);
          border-right-color: var(--danger);
        }

        .login-alert-success {
          background-color: var(--success-light);
          color: var(--success);
          border-right-color: var(--success);
        }

        .login-forgot-link {
          display: flex;
          justify-content: flex-start;
          margin: -4px 0 var(--space-3) 0;
        }

        .login-forgot-link a,
        .login-back-link a {
          color: var(--primary);
          font-size: 0.8125rem;
          text-decoration: none;
          font-weight: 600;
          transition: opacity var(--dur-fast) var(--ease-in-out);
        }

        .login-forgot-link a:hover,
        .login-back-link a:hover {
          opacity: 0.8;
        }

        .login-back-link {
          text-align: center;
          margin-top: var(--space-4);
        }
      `}</style>
    </div>
  );
}
