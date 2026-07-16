import React, { useRef, useEffect, useCallback, useMemo, useLayoutEffect, useState } from 'react';
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
  const touchStartY = useRef(null);
  const currentIndexRef = useRef(0);

  const currentIndex = useMemo(() => tabs.findIndex(t => t.id === activeTab), [activeTab, tabs]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  /* Animated pill indicator position. We measure each tab with ResizeObserver/onLayout
     and animate via CSS transforms. width tracks the active item width so inactive items
     stay compact, matching iOS segmented control. */
  const navRef = useRef(null);
  const itemsRef = useRef({});
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false });

  const recomputeIndicator = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const isRTL = getComputedStyle(navEl).direction === 'rtl';
    const activeEl = itemsRef.current[activeTab];
    if (!activeEl) return;
    const navRect = navEl.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    const rawX = isRTL ? navRect.right - aRect.right : aRect.left - navRect.left;
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
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    if (!isHorizontal) { touchStartX.current = null; touchStartY.current = null; return; }

    const nav = navRef.current;
    const isRTL = nav ? getComputedStyle(nav).direction === 'rtl' : false;
    const threshold = 60;
    const velocity = Math.abs(dx);
    const fastSwipe = velocity > 0.5;
    if (!fastSwipe && Math.abs(dx) < threshold) { touchStartX.current = null; touchStartY.current = null; return; }

    const idx = currentIndexRef.current;
    let newIndex;
    if (isRTL) {
      // RTL: swipe left goes forward (next), swipe right goes back.
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
          background-color: rgba(30, 64, 175, 0.85);
          padding: 6px;
          border-radius: 40px;
          width: 92%;
          max-width: 460px;
          box-shadow:
            0 16px 32px rgba(30, 64, 175, 0.28),
            0 6px 14px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          position: relative;
          isolation: isolate;
        }
        
        .nav-indicator {
          position: absolute;
          top: 6px;
          bottom: 6px;
          left: 0;
          background: #ffffff;
          border-radius: 40px;
          transition: transform var(--dur-base) var(--ease-ios), width var(--dur-base) var(--ease-ios);
          z-index: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .nav-item {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 10px 14px;
          min-height: var(--tap-target);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color var(--dur-base) var(--ease-quick);
          border-radius: 999px;
          gap: 6px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .nav-item:active {
          transform: scale(var(--press-scale));
        }

        .nav-item.active {
          color: var(--primary);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--dur-base) var(--ease-spring);
        }

        .nav-item.active .nav-icon {
          transform: scale(1.08);
        }

        .nav-label {
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          animation: navSlideIn var(--dur-base) var(--ease-ios) forwards;
        }

        @keyframes navSlideIn {
          from {
            max-width: 0;
            opacity: 0;
            transform: translateX(-4px);
          }
          to {
            max-width: 120px;
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-item, .nav-icon, .nav-label, .nav-indicator {
            transition: none !important;
            animation: none !important;
          }
        }

        .app-container.dark-theme .bottom-navbar {
          background-color: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
        }

        .app-container.dark-theme .nav-indicator {
          background: var(--primary);
        }

        .app-container.dark-theme .nav-item.active {
          background-color: transparent !important;
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
