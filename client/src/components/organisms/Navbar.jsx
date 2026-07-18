import React, { useRef, useEffect, useCallback, useMemo, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Home, CheckSquare, MessageCircle, Users, Shield } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function Navbar({ activeTab, setActiveTab, currentUser }) {
  const isSuperAdminRole = (role) => role && (role.includes('الادمن المطور') || role.includes('Super Admin'));
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  const tabs = useMemo(() => {
    const base = [
      { id: 'dashboard', label: 'الرئيسية' },
      { id: 'tasks', label: 'المهام' },
      { id: 'chat', label: 'المحادثة' },
      { id: 'team', label: 'الفريق' }
    ];

    if (isSuperAdmin) {
      base.push({ id: 'admin', label: 'الإدارة' });
    }

    return base;
  }, [isSuperAdmin]);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const currentIndexRef = useRef(0);

  const currentIndex = useMemo(() => tabs.findIndex(t => t.id === activeTab), [activeTab, tabs]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const navRef = useRef(null);
  const itemsRef = useRef({});
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false });

  const recomputeIndicator = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const activeEl = itemsRef.current[activeTab];
    if (!activeEl) return;
    const navRect = navEl.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    const rawX = aRect.left - navRect.left;
    setIndicator({ x: rawX, w: aRect.width, ready: true });
  }, [activeTab]);

  useLayoutEffect(() => {
    recomputeIndicator();
  }, [recomputeIndicator, tabs.length, currentIndex]);

  useEffect(() => {
    const onResize = () => recomputeIndicator();
    window.addEventListener('resize', onResize);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      ro = new ResizeObserver(onResize);
      ro.observe(navRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [recomputeIndicator]);

  const commitSwipe = useCallback((newTabId) => {
    triggerHaptic('selection');
    setActiveTab(newTabId);
  }, [setActiveTab]);

  const handleTouchStart = useCallback((e) => {
    const isHorizontalScroll = e.target.closest('.horizontal-date-scroll') || 
                               e.target.closest('.kanban-board-desktop') ||
                               e.target.closest('.assignee-filter-bar') ||
                               e.target.closest('.priority-filter-bar') ||
                               e.target.closest('.messages-container');
    if (isHorizontalScroll) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 40) return;
    const idx = currentIndexRef.current;
    const isRTL = document.documentElement.dir === 'rtl';
    let newIndex;
    if (isRTL) {
      if (dx < 0 && idx < tabs.length - 1) newIndex = idx + 1;
      else if (dx > 0 && idx > 0) newIndex = idx - 1;
    } else {
      if (dx > 0 && idx < tabs.length - 1) newIndex = idx + 1;
      else if (dx < 0 && idx > 0) newIndex = idx - 1;
    }
    if (newIndex !== undefined) {
      commitSwipe(tabs[newIndex].id);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [commitSwipe, tabs]);

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
      <div className="bottom-navbar" ref={navRef}>
        {indicator.ready && (
          <span
            className="nav-indicator"
            aria-hidden="true"
            style={{
              transform: `translateX(${indicator.x}px)`,
              width: `${indicator.w}px`
            }}
          />
        )}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const renderIcon = () => {
            const size = 20;
            const strokeWidth = isActive ? 2.4 : 2.0;
            const fill = isActive ? "currentColor" : "none";
            switch (tab.id) {
              case 'dashboard':
                return <Home size={size} strokeWidth={strokeWidth} fill={fill} />;
              case 'tasks':
                return <CheckSquare size={size} strokeWidth={strokeWidth} fill={fill} />;
              case 'chat':
                return <MessageCircle size={size} strokeWidth={strokeWidth} fill={fill} />;
              case 'team':
                return <Users size={size} strokeWidth={strokeWidth} fill={fill} />;
              case 'admin':
                return <Shield size={size} strokeWidth={strokeWidth} fill={fill} />;
              default:
                return null;
            }
          };

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) itemsRef.current[tab.id] = el;
                else delete itemsRef.current[tab.id];
              }}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (!isActive) commitSwipe(tab.id);
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon">{renderIcon()}</span>
              {isActive && <span className="nav-label sr-only">{tab.label}</span>}
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-navbar-wrapper {
          position: absolute;
          bottom: var(--space-5);
          bottom: calc(var(--space-5) + var(--safe-bottom, 0px));
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
          background-color: #212328;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6px;
          border-radius: 40px;
          width: 90%;
          max-width: 380px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          position: relative;
          isolation: isolate;
        }
        
        .nav-indicator {
          position: absolute;
          top: 6px;
          height: 48px;
          left: 0;
          background: var(--primary);
          border-radius: 50%;
          transition: transform var(--nav-pill-shift) var(--ease-out), width var(--nav-pill-shift) var(--ease-out);
          z-index: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .nav-item {
          background: transparent;
          border: none;
          color: #8a8d94;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease-in-out);
          border-radius: 50%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          position: relative;
          z-index: 1;
        }

        .nav-item:active {
          transform: scale(var(--press-scale));
        }

        .nav-item.active {
          color: #ffffff;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-item, .nav-icon, .nav-indicator {
            transition: none !important;
            animation: none !important;
          }
        }

        .app-container.dark-theme .bottom-navbar {
          background-color: #16171c;
          border-color: rgba(255, 255, 255, 0.03);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        }

        .app-container.dark-theme .nav-indicator {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .app-container.dark-theme .nav-item.active {
          color: #ffffff;
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
