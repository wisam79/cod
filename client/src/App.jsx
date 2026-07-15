import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Navbar from './components/organisms/Navbar';
import NotificationDrawer from './components/organisms/NotificationDrawer';
import ToastContainer from './components/organisms/ToastContainer';
import Avatar from './components/atoms/Avatar';
import { triggerHaptic } from './utils/haptics';

import { 
  WifiOff, 
  Loader2, 
  Activity, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Bell, 
  LogOut,
  Download,
  X
} from 'lucide-react';

const Dashboard = React.lazy(() => import('./components/pages/Dashboard'));
const TaskManager = React.lazy(() => import('./components/pages/TaskManager'));
const ChatRoom = React.lazy(() => import('./components/pages/ChatRoom'));
const TeamDirectory = React.lazy(() => import('./components/pages/TeamDirectory'));
const Login = React.lazy(() => import('./components/pages/Login'));
import './App.css';

function App() {
  const {
    currentUser,
    isAuthenticated,
    notifications,
    activeToasts,
    wsStatus,
    isOffline,
    isLoading,
    fetchCurrentUser,
    initWebSocket,
    clearNotifications,
    setOffline,
    logout
  } = useAppStore();

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    return ['dashboard', 'tasks', 'chat', 'team'].includes(hash) ? hash : 'dashboard';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });



  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (['dashboard', 'tasks', 'chat', 'team'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    const currentHash = window.location.hash.replace('#/', '');
    if (!['dashboard', 'tasks', 'chat', 'team'].includes(currentHash)) {
      window.location.hash = '#/dashboard';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!isAuthenticated) {
        return;
      }
      if (['dashboard', 'tasks', 'chat', 'team'].includes(hash)) {
        setActiveTab(hash);
      } else if (drawerOpen) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, drawerOpen]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      const dismissed = localStorage.getItem('install-banner-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredInstallPrompt) return;
    triggerHaptic('medium');
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      triggerHaptic('success');
    }
    setDeferredInstallPrompt(null);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('install-banner-dismissed', 'true');
    triggerHaptic('light');
  };

  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      triggerHaptic('success');
    };
    const handleOffline = () => {
      setOffline(true);
      triggerHaptic('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline, triggerHaptic]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSetActiveTab = (tab) => {
    if (tab !== activeTab) {
      triggerHaptic('light');
      window.location.hash = `#/${tab}`;
    }
  };

  const toggleDarkMode = () => {
    triggerHaptic('light');
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const renderTabContent = () => {
    return (
      <React.Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="loader"></div>
        </div>
      }>
        <div className={`animate-page-in`} key={activeTab}>
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return <Dashboard />;
              case 'tasks':
                return <TaskManager />;
              case 'chat':
                return <ChatRoom />;
              case 'team':
                return <TeamDirectory />;
              default:
                return <Dashboard />;
            }
          })()}
        </div>
      </React.Suspense>
    );
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className={`phone-mockup-wrapper ${fullscreen ? 'fullscreen' : ''}`}>
        {!fullscreen && <div className="phone-notch"></div>}
        <div className={`app-container loader-container ${isDarkMode ? 'dark-theme' : ''}`}>
          <div className="loader"></div>
          <p className="loading-text" style={{ marginTop: '16px', fontWeight: '700', color: 'var(--primary)' }}>جاري تحميل مُهِمَّة...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`phone-mockup-wrapper ${fullscreen ? 'fullscreen' : ''}`}>
        {!fullscreen && <div className="phone-notch"></div>}
        <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`} style={{ overflowY: 'auto' }}>
          <React.Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div className="loader"></div>
            </div>
          }>
            <Login />
          </React.Suspense>
        </div>
      </div>
    );
  }

  const user = currentUser || { name: 'عضو الفريق', role: 'متصل', avatar: '' };

  return (
    <div className={`phone-mockup-wrapper ${fullscreen ? 'fullscreen' : ''}`}>
      {!fullscreen && <div className="phone-notch"></div>}
      
      <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
        <ToastContainer activeToasts={activeToasts} />

        <div className="connection-status-bars">
          {isOffline && (
            <div className="status-bar offline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <WifiOff size={14} />
              أنت تعمل في وضع عدم الاتصال (Offline)
            </div>
          )}
          {!isOffline && wsStatus === 'connecting' && (
            <div className="status-bar connecting" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
              جاري إعادة اتصال البث المباشر...
            </div>
          )}
          {!isOffline && wsStatus === 'disconnected' && (
            <div className="status-bar disconnected" onClick={() => { initWebSocket(); triggerHaptic('medium'); }} role="button" tabIndex={0} aria-label="إعادة الاتصال بالبث المباشر" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Activity size={14} />
              انقطع البث المباشر. اضغط لإعادة الاتصال
            </div>
          )}
        </div>

        <div className="header-bar">
          <div className="header-user">
            <Avatar src={user.avatar} alt={user.name} size="md" className="avatar" />
            <div className="user-info">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user.name}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                  <span className={`ws-indicator-dot ${wsStatus}`} title={`البث الفوري: ${wsStatus}`} aria-hidden="true"></span>
                  {wsStatus === 'connected' ? 'متصل' : wsStatus === 'connecting' ? 'يتصل...' : 'مفصول'}
                </span>
              </h3>
              <p>{user.role}</p>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="icon-btn" 
              onClick={toggleDarkMode} 
              title={isDarkMode ? "الوضع المضيء" : "الوضع الداكن"}
              aria-label={isDarkMode ? "الوضع المضيء" : "الوضع الداكن"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              className="icon-btn" 
              onClick={() => { setFullscreen(!fullscreen); triggerHaptic('medium'); }} 
              title={fullscreen ? "عرض الهاتف" : "وضع ملء الشاشة"}
              aria-label={fullscreen ? "عرض الهاتف" : "وضع ملء الشاشة"}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button 
              className="icon-btn" 
              onClick={() => { setDrawerOpen(true); triggerHaptic('light'); }}
              aria-label="مركز التنبيهات"
              aria-expanded={drawerOpen}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="badge-count" aria-label={`${notifications.length} إشعار جديد`}>{notifications.length}</span>
              )}
            </button>

            <button className="icon-btn logout-btn" onClick={() => { triggerHaptic('medium'); logout(); }} title="تسجيل الخروج" aria-label="تسجيل الخروج">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="scrollable-content">
          {renderTabContent()}
        </div>

        <NotificationDrawer 
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          notifications={notifications}
          onClear={clearNotifications}
        />

        <Navbar activeTab={activeTab} setActiveTab={handleSetActiveTab} />

        {showInstallBanner && deferredInstallPrompt && (
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
        )}
      </div>
    </div>
  );
}

export default App;
