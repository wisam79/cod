import React from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function InstallBanner({ deferredInstallPrompt, showInstallBanner, setShowInstallBanner, showUpdateBanner }) {
  if (!showInstallBanner && !showUpdateBanner) return null;

  const handleInstall = async () => {
    if (!deferredInstallPrompt) return;
    triggerHaptic('medium');
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      triggerHaptic('success');
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('install-banner-dismissed', 'true');
    triggerHaptic('light');
  };

  if (showUpdateBanner) {
    return (
      <div className="install-banner" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
        <div className="install-banner-icon">
          <RefreshCw size={20} color="#fff" />
        </div>
        <div className="install-banner-text">
          <h4>تحديث جديد متاح</h4>
          <p>قم بتحديث التطبيق للحصول على أحدث الإصدار</p>
        </div>
        <div className="install-banner-actions">
          <button className="install-btn-accept" onClick={() => window.location.reload()}>تحديث</button>
        </div>
      </div>
    );
  }

  if (showInstallBanner && deferredInstallPrompt) {
    return (
      <div className="install-banner">
        <div className="install-banner-icon">
          <Download size={20} color="#fff" />
        </div>
        <div className="install-banner-text">
          <h4>تثبيت مُهِمَّة</h4>
          <p>أضف التطبيق إلى الشاشة الرئيسية</p>
        </div>
        <div className="install-banner-actions">
          <button className="install-btn-accept" onClick={handleInstall}>تثبيت</button>
          <button className="install-btn-dismiss" onClick={dismissInstallBanner}>
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
