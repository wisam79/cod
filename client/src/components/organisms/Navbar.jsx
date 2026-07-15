import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Home, CheckSquare, MessageSquare, Users, ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function Navbar({ activeTab, setActiveTab, currentUser }) {
  const isSuperAdmin = currentUser?.role && (currentUser.role.includes('الادمن المطور') || currentUser.role.includes('Super Admin'));

  const tabs = useMemo(() => {
    const base = [
      {
        id: 'dashboard',
        label: 'الرئيسية',
        icon: <Home size={20} strokeWidth={2.5} />
      },
      {
        id: 'tasks',
        label: 'المهام',
        icon: <CheckSquare size={20} strokeWidth={2.5} />
      },
      {
        id: 'chat',
        label: 'المحادثة',
        icon: <MessageSquare size={20} strokeWidth={2.5} />
      },
      {
        id: 'team',
        label: 'الفريق',
        icon: <Users size={20} strokeWidth={2.5} />
      }
    ];

    if (isSuperAdmin) {
      base.push({
        id: 'admin',
        label: 'الإدارة',
        icon: <ShieldAlert size={20} strokeWidth={2.5} />
      });
    }

    return base;
  }, [isSuperAdmin]);

  const touchStartX = useRef(null);
  const currentIndexRef = useRef(0);

  const currentIndex = useMemo(() => tabs.findIndex(t => t.id === activeTab), [activeTab, tabs]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 60;

    if (Math.abs(diff) > threshold) {
      const idx = currentIndexRef.current;
      let newIndex;
      if (diff > 0 && idx < tabs.length - 1) {
        newIndex = idx + 1;
      } else if (diff < 0 && idx > 0) {
        newIndex = idx - 1;
      }
      if (newIndex !== undefined) {
        triggerHaptic('light');
        setActiveTab(tabs[newIndex].id);
      }
    }
    touchStartX.current = null;
  }, [setActiveTab, tabs]);

  useEffect(() => {
    const container = document.querySelector('.scrollable-content');
    if (!container) return;
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div className="bottom-navbar-wrapper">
      <div className="bottom-navbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon">{tab.icon}</span>
              {isActive && <span className="nav-label">{tab.label}</span>}
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-navbar-wrapper {
          position: absolute;
          bottom: 24px;
          bottom: calc(24px + var(--safe-bottom, 0px));
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          pointer-events: none;
        }

        .bottom-navbar {
          pointer-events: auto;
          display: flex;
          justify-content: space-around;
          align-items: center;
          background-color: var(--primary);
          padding: 8px 12px;
          border-radius: 40px;
          width: 90%;
          box-shadow: 0 12px 30px rgba(30, 64, 175, 0.25), 0 4px 12px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-item {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 30px;
          gap: 8px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          position: relative;
        }

        .nav-item:active {
          transform: scale(0.88);
        }

        .nav-item.active {
          background-color: #FFFFFF;
          color: var(--primary);
          padding: 8px 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
          animation: navSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes navSlideIn {
          from {
            width: 0;
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            width: auto;
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

Navbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  currentUser: PropTypes.object
};
