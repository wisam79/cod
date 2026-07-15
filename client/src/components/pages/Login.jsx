import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

export default function Login() {
  const { login, isLoading, error } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Handled by store
    }
  };

  return (
    <div className="login-view animate-fade-in text-right">
      <div className="login-logo-container">
        <div className="login-logo-svg-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <div className="login-card card">
        <h3>تسجيل الدخول للمتابعة</h3>

        {error && (
          <div className="login-error-alert">
            {error}
          </div>
        )}

        <div className="login-hint">
          للأدمن: <strong>wisam@mohemmaty.com</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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

      <style>{`
        .login-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          padding: 20px;
          gap: 24px;
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
