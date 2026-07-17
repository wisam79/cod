import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Navbar from './components/organisms/Navbar';
import NotificationDrawer from './components/organisms/NotificationDrawer';
import ToastContainer from './components/organisms/ToastContainer';
import Avatar from './components/atoms/Avatar';
import ProfileModal from './components/organisms/ProfileModal';
import { SkeletonPage, SkeletonChat } from './components/atoms/Skeleton';
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
  X,
  RefreshCw,
  Home,
  MessageSquare,
  Users,
  ShieldAlert,
  Settings,
  CheckSquare
} from 'lucide-react';

const Dashboard = React.lazy(() => import('./components/pages/Dashboard'));
const TaskManager = React.lazy(() => import('./components/pages/TaskManager'));
const ChatRoom = React.lazy(() => import('./components/pages/ChatRoom'));
const TeamDirectory = React.lazy(() => import('./components/pages/TeamDirectory'));
const AdminDashboard = React.lazy(() => import('./components/pages/AdminDashboard'));
const Maintenance = React.lazy(() => import('./components/pages/Maintenance'));
const Login = React.lazy(() => import('./components/pages/Login'));
import './App.css';

const isSuperAdminRole = (role) => role && (role.includes('الادمن المطور') || role.includes('Super Admin'));

const TAB_ORDER = ['dashboard', 'tasks', 'chat', 'team', 'admin'];

const TAB_TITLES = {
  dashboard: 'لوحة التحكم',
  tasks: 'قائمة المهام',
  chat: 'المحادثة الجماعية',
  team: 'أعضاء الفريق',
  admin: 'إعدادات الإدارة'
};

function App() {
  const currentUser = useAppStore(s => s.currentUser);
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const notifications = useAppStore(s => s.notifications);
  const activeToasts = useAppStore(s => s.activeToasts);
  const wsStatus = useAppStore(s => s.wsStatus);
  const isOffline = useAppStore(s => s.isOffline);
  const authLoading = useAppStore(s => s.authLoading);
  const fetchCurrentUser = useAppStore(s => s.fetchCurrentUser);
  const initWebSocket = useAppStore(s => s.initWebSocket);
  const clearNotifications = useAppStore(s => s.clearNotifications);
  const setOffline = useAppStore(s => s.setOffline);
  const logout = useAppStore(s => s.logout);

  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  const activeTab = TAB_ORDER.includes(location.pathname.slice(1)) 
    ? location.pathname.slice(1) 
    : 'dashboard';

  const [simulateMobile, setSimulateMobile] = useState(() => {
    return localStorage.getItem('simulate_mobile') === 'true';
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [pageDirection, setPageDirection] = useState('right');
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const prevTabRef = useRef('dashboard');

  useEffect(() => {
    const onMaintenance = () => setIsMaintenance(true);
    const onResolved = () => setIsMaintenance(false);
    window.addEventListener('system-maintenance', onMaintenance);
    window.addEventListener('system-maintenance-resolved', onResolved);
    return () => {
      window.removeEventListener('system-maintenance', onMaintenance);
      window.removeEventListener('system-maintenance-resolved', onResolved);
    };
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDarkMode ? '#0f172a' : '#1e40af');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isAuthenticated) {
      const cleanPath = location.pathname.slice(1);
      if (location.pathname === '/' || !TAB_ORDER.includes(cleanPath)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
      const currIdx = TAB_ORDER.indexOf(activeTab);
      setPageDirection(currIdx > prevIdx ? 'right' : 'left');
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    if (drawerOpen) {
      const handlePopState = () => {
        setDrawerOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [drawerOpen]);

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
      const state = useAppStore.getState();
      if (state.isAuthenticated) {
        state.fetchInitialData().catch(() => {});
        state.initWebSocket();
      }
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
  }, [setOffline]);

  const handleSetActiveTab = useCallback((tab) => {
    if (tab !== activeTab) {
      triggerHaptic('light');
      navigate(`/${tab}`, { replace: false });
    }
  }, [activeTab, navigate]);

  const toggleDarkMode = () => {
    triggerHaptic('light');
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleSimulateMobile = () => {
    triggerHaptic('light');
    setSimulateMobile(prev => {
      const next = !prev;
      localStorage.setItem('simulate_mobile', next ? 'true' : 'false');
      return next;
    });
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdateBanner(true);
      });
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const cachedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('offline_user')); } catch { return null; }
  }, []);

  const getSkeleton = useCallback(() => {
    switch (activeTab) {
      case 'dashboard': return <SkeletonPage cards={4} />;
      case 'tasks': return <SkeletonPage cards={5} />;
      case 'chat': return <SkeletonChat />;
      case 'team': return <SkeletonPage cards={6} lines={1} />;
      case 'admin': return <SkeletonPage cards={4} />;
      default: return <SkeletonPage cards={3} />;
    }
  }, [activeTab]);

  const renderTabContent = useMemo(() => {
    return (
      <React.Suspense fallback={getSkeleton()}>
        <div className={pageDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'} key={activeTab}>
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
              case 'admin':
                return <AdminDashboard />;
              default:
                return <Dashboard />;
            }
          })()}
        </div>
      </React.Suspense>
    );
  }, [activeTab, pageDirection, getSkeleton]);

  if (isMaintenance) {
    return (
      <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
        <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}><div className="loader"></div></div>}>
          <Maintenance />
        </React.Suspense>
      </div>
    );
  }

  const showFullLoader = authLoading && !isAuthenticated && !cachedUser;
  if (showFullLoader) {
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
      <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`} style={{ overflowY: 'auto' }}>
        <React.Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="loader"></div>
          </div>
        }>
          <Login />
        </React.Suspense>
      </div>
    );
  }

  const user = currentUser || { name: 'عضو الفريق', role: 'متصل', avatar: '' };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''} ${simulateMobile ? 'simulate-mobile' : ''}`}>
      <ToastContainer activeToasts={activeToasts} />

      <div className="app-layout-wrapper">
        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <CheckSquare size={22} style={{ color: '#fff' }} />
            </div>
            <div className="logo-text">
              <h2>مُهِمَّة</h2>
              <span className="logo-sub font-english">Mohemmaty</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleSetActiveTab('dashboard')}>
              <Home size={18} />
              <span>لوحة التحكم</span>
            </button>
            <button className={`sidebar-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => handleSetActiveTab('tasks')}>
              <CheckSquare size={18} />
              <span>إدارة المهام</span>
            </button>
            <button className={`sidebar-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleSetActiveTab('chat')}>
              <MessageSquare size={18} />
              <span>غرفة المحادثة</span>
            </button>
            <button className={`sidebar-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => handleSetActiveTab('team')}>
              <Users size={18} />
              <span>دليل الفريق</span>
            </button>
            {isSuperAdmin && (
              <button className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => handleSetActiveTab('admin')}>
                <ShieldAlert size={18} />
                <span>لوحة الإدارة</span>
              </button>
            )}
            <button className="sidebar-item settings-btn" onClick={() => { setProfileOpen(true); triggerHaptic('light'); }}>
              <Settings size={18} />
              <span>الإعدادات</span>
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <div className="sidebar-user-info" onClick={() => { setProfileOpen(true); triggerHaptic('light'); }} style={{ cursor: 'pointer' }}>
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-role">{user.role}</span>
              </div>
            </div>
            <div className="sidebar-status">
              <span className={`ws-indicator-dot ${wsStatus}`}></span>
              <span>جودة الاتصال: {wsStatus === 'connected' ? 'ممتاز' : 'مفصول'}</span>
            </div>
            <span className="version font-english">الإصدار 1.0.0</span>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="main-viewport">
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

          <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {activeTab === 'dashboard' ? (
              <div className="header-welcome-container" onClick={() => { setProfileOpen(true); triggerHaptic('light'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Avatar src={user.avatar} alt={user.name} size="md" className="avatar" />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    أهلاً، {user.name.split(' ')[0]} 👋
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {user.email || user.role || 'عضو متصل'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="header-user" onClick={() => { setProfileOpen(true); triggerHaptic('light'); }} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label="تعديل الملف الشخصي">
                <Avatar src={user.avatar} alt={user.name} size="md" className="avatar" />
              </div>
            )}

            {activeTab !== 'dashboard' && (
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {TAB_TITLES[activeTab] || 'مُهِمَّة'}
              </h2>
            )}

            <div className="header-actions">
              <button 
                className="icon-btn" 
                onClick={() => { setDrawerOpen(true); triggerHaptic('light'); }}
                aria-label="مركز التنبيهات"
                aria-expanded={drawerOpen}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="badge-count" aria-label={`${notifications.length} إشعار جديد`}>{notifications.length}</span>
                )}
              </button>
            </div>
          </div>

          <div className="scrollable-content">
            {renderTabContent}
          </div>

          <ProfileModal 
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            fullscreen={fullscreen}
            toggleFullscreen={() => setFullscreen(!fullscreen)}
            simulateMobile={simulateMobile}
            toggleSimulateMobile={toggleSimulateMobile}
          />

          <NotificationDrawer 
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            notifications={notifications}
            onClear={clearNotifications}
          />

          <Navbar activeTab={activeTab} setActiveTab={handleSetActiveTab} currentUser={currentUser} />

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

          {showUpdateBanner && (
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
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
