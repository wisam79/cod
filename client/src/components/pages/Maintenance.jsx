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
      <div className="maintenance-card card">
        <div className="maintenance-icon">⚠️</div>
        <h1>تحديث النظام قيد التنفيذ</h1>
        <p className="maintenance-desc">
          التطبيق حالياً تحت الصيانة الدورية لتحسين مستوى الخدمة وإضافة تحديثات جديدة.
        </p>
        <p className="maintenance-sub">
          سنعود للعمل قريباً. شكراً لتفهمكم وصبركم.
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
          background: var(--bg-app);
          padding: var(--space-5);
        }
        .maintenance-card {
          max-width: 380px;
          width: 100%;
          text-align: center;
          padding: var(--space-8) var(--space-5);
        }
        .maintenance-icon {
          font-size: 40px;
          margin-bottom: var(--space-4);
          display: inline-block;
        }
        .maintenance-card h1 {
          color: var(--text-main);
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: var(--space-3);
        }
        .maintenance-desc {
          color: var(--text-muted);
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: var(--space-2);
        }
        .maintenance-sub {
          color: var(--text-faint);
          font-size: 0.75rem;
          margin-bottom: var(--space-6);
        }
        .maintenance-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
      `}</style>
    </div>
  );
}
