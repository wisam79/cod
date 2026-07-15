import React from 'react';
import Button from '../atoms/Button';
import { useAppStore } from '../../store/useAppStore';

export default function Maintenance() {
  const { logout } = useAppStore();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="maintenance-view animate-fade-in text-center">
      <div className="maintenance-card card-glass">
        <div className="maintenance-icon">🛠️</div>
        <h1>تحديث النظام قيد التنفيذ</h1>
        <p className="maintenance-desc">
          التطبيق حالياً تحت الصيانة الدورية لتحسين مستوى الخدمة وإضافة تحديثات جديدة.
        </p>
        <p className="maintenance-sub">
          سنعود للعمل قريباً جداً. شكراً لتفهمكم وصبركم! 🙏
        </p>
        
        <div className="maintenance-actions">
          <Button variant="primary" onClick={handleRefresh}>
            إعادة محاولة الاتصال 🔄
          </Button>
          <Button variant="secondary" onClick={() => logout()}>
            تسجيل الخروج
          </Button>
        </div>
      </div>

      <style>{`
        .maintenance-view {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f172a;
          padding: 24px;
          font-family: 'IBM Plex Sans Arabic', sans-serif;
        }
        .maintenance-card {
          max-width: 500px;
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .maintenance-icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: wrenchWiggle 2.5s ease-in-out infinite;
          display: inline-block;
        }
        .maintenance-card h1 {
          color: #f3f4f6;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .maintenance-desc {
          color: #d1d5db;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .maintenance-sub {
          color: #9ca3af;
          font-size: 14px;
          margin-bottom: 32px;
        }
        .maintenance-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        @keyframes wrenchWiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
