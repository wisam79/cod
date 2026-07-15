import React, { useRef, useState, useCallback, useEffect } from 'react';

const STATUS = { PULLING: 'pulling', READY: 'ready', REFRESHING: 'refreshing', IDLE: 'idle' };

export default function PullToRefresh({ onRefresh, children, isRefreshing: externalRefreshing }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef(null);
  const isRefreshing = externalRefreshing !== undefined ? externalRefreshing : status === STATUS.REFRESHING;

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current) return;
    e.preventDefault();
    const diff = e.touches[0].clientY - startY.current;
    if (diff <= 0) { setPullDistance(0); return; }
    const distance = Math.min(diff * 0.5, 100);
    setPullDistance(distance);
    setStatus(distance >= 60 ? STATUS.READY : STATUS.PULLING);
  }, []);

  const handleTouchStart = useCallback((e) => {
    let el = e.target instanceof Element ? e.target : null;
    while (el && el !== containerRef.current) {
      const style = getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') break;
      el = el.parentElement;
    }
    const scroller = el || containerRef.current;
    if (scroller && scroller.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= 60) {
      if (externalRefreshing === undefined) setStatus(STATUS.REFRESHING);
      setPullDistance(40);
      const result = onRefresh && onRefresh();
      if (result && result.then) {
        result.finally(() => {
          setPullDistance(0);
          if (externalRefreshing === undefined) setStatus(STATUS.IDLE);
        });
      } else if (externalRefreshing === undefined) {
        setTimeout(() => { setStatus(STATUS.IDLE); setPullDistance(0); }, 800);
      } else {
        setPullDistance(0);
      }
    } else {
      setStatus(STATUS.IDLE);
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh, externalRefreshing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [handleTouchMove]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', minHeight: '100%' }}
    >
      <div style={{
        position: 'absolute', top: -40 + pullDistance, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 40, transition: pullDistance > 0 ? 'none' : 'top 0.3s ease',
        fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)',
        gap: 8,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: `rotate(${isRefreshing ? 360 : (pullDistance / 60) * 360}deg)`,
            animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
            transition: isRefreshing ? 'none' : 'transform 0.2s ease',
          }}
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        {isRefreshing ? 'جارٍ التحديث...' : pullDistance >= 60 ? 'أفلت للتحديث' : 'اسحب للتحديث'}
      </div>
      <div style={{
        transform: `translateY(${pullDistance}px)`,
        transition: status === STATUS.REFRESHING ? 'transform 0.3s ease' : pullDistance > 0 ? 'none' : 'transform 0.3s ease',
        willChange: 'transform',
      }}>
        {children}
      </div>
    </div>
  );
}
