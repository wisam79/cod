import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Navbar from './components/organisms/Navbar';
import NotificationDrawer from './components/organisms/NotificationDrawer';
import ToastContainer from './components/organisms/ToastContainer';
import ProfileModal from './components/organisms/ProfileModal';
import ConnectionStatusBar from './components/organisms/ConnectionStatusBar';
import HeaderBar from './components/organisms/HeaderBar';
import DesktopSidebar from './components/organisms/DesktopSidebar';
import InstallBanner from './components/organisms/InstallBanner';
import { SkeletonPage, SkeletonChat } from './components/atoms/Skeleton';
import { triggerHaptic } from './utils/haptics';

import { 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2
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
        <React.Suspense fallback={<div className="flex-center-viewport"><div className="loader"></div></div>}>
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
          <p className="loading-text">جاري تحميل مُهِمَّة...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const renderLogin = (
      <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`} style={{ overflowY: 'auto' }}>
        <React.Suspense fallback={
          <div className="flex-center-full">
            <div className="loader"></div>
          </div>
        }>
          <Login />
        </React.Suspense>
      </div>
    );

    if (simulateMobile && !fullscreen) {
      return (
        <div className={`phone-mockup-wrapper ${isDarkMode ? 'dark-theme' : ''}`}>
          <div className="phone-notch" />
          {renderLogin}
          <div className="phone-home-indicator" />
        </div>
      );
    }
    return renderLogin;
  }

  const user = currentUser || { name: 'عضو الفريق', role: 'متصل', avatar: '' };

  const renderApp = (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''} ${simulateMobile ? 'simulate-mobile' : ''}`}>
      <ToastContainer activeToasts={activeToasts} />

      <div className="app-layout-wrapper">
        {/* Desktop Sidebar */}
        <DesktopSidebar 
          activeTab={activeTab} 
          handleSetActiveTab={handleSetActiveTab}
          user={user}
          wsStatus={wsStatus}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* Main Viewport */}
        <main className="main-viewport">
          <ConnectionStatusBar />

          <HeaderBar 
            activeTab={activeTab} 
            user={user} 
            onOpenNotifications={() => setDrawerOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
          />

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

          <InstallBanner 
            deferredInstallPrompt={deferredInstallPrompt}
            showInstallBanner={showInstallBanner}
            setShowInstallBanner={setShowInstallBanner}
            showUpdateBanner={showUpdateBanner}
          />
        </main>
      </div>
    </div>
  );

  if (simulateMobile && !fullscreen) {
    return (
      <div className={`phone-mockup-wrapper ${isDarkMode ? 'dark-theme' : ''}`}>
        <div className="phone-notch" />
        {renderApp}
        <div className="phone-home-indicator" />
      </div>
    );
  }
  return renderApp;
}

export default App;
