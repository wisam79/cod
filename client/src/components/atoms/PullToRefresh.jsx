import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { triggerHaptic } from '../../utils/haptics';

const STATUS = { PULLING: 'pulling', READY: 'ready', REFRESHING: 'refreshing', IDLE: 'idle' };
const THRESHOLD = 64;
const RUBBER_BAND_MAX = 140;

export default function PullToRefresh({ onRefresh, children, isRefreshing: externalRefreshing }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const startX = useRef(0);
  const pulling = useRef(false);
  const pullDirectionChecked = useRef(false);
  const isPullingDown = useRef(false);
  const firedThresholdHaptic = useRef(false);
  const containerRef = useRef(null);
  const isRefreshing = externalRefreshing !== undefined ? externalRefreshing : status === STATUS.REFRESHING;

  /* Rubber-band curve: grows slower as you pull further. */
  const applyRubber = (raw) => {
    if (raw <= 0) return 0;
    const ratio = 0.45 - Math.max(0, raw - 240) * 0.00008;
    const eased = raw * ratio;
    return Math.min(eased, RUBBER_BAND_MAX);
  };

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current) return;
    const t = e.touches[0];
    const diffY = t.clientY - startY.current;
    const diffX = Math.abs(t.clientX - startX.current);

    // Check direction on first significant movement
    if (!pullDirectionChecked.current) {
      const distance = Math.sqrt(diffY * diffY + diffX * diffX);
      if (distance > 8) {
        pullDirectionChecked.current = true;
        // Dominant vertical pull-down check
        if (diffY > 5 && diffY > diffX * 1.5) {
          isPullingDown.current = true;
        } else {
          isPullingDown.current = false;
          pulling.current = false;
        }
      }
      return;
    }

    if (!isPullingDown.current) return;

    e.preventDefault();
    const distance = applyRubber(diffY);
    setPullDistance(distance);
    const reached = distance >= THRESHOLD;
    setStatus(reached ? STATUS.READY : STATUS.PULLING);
    if (reached && !firedThresholdHaptic.current) {
      firedThresholdHaptic.current = true;
      triggerHaptic('selection');
    } else if (!reached && firedThresholdHaptic.current) {
      firedThresholdHaptic.current = false;
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    let el = e.target instanceof Element ? e.target : null;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        break;
      }
      el = el.parentElement;
    }
    const scroller = el && el !== document.body ? el : document.querySelector('.scrollable-content') || containerRef.current;
    if (scroller && scroller.scrollTop <= 0) {
      startY.current = t.clientY;
      startX.current = t.clientX;
      pulling.current = true;
      pullDirectionChecked.current = false;
      isPullingDown.current = false;
      firedThresholdHaptic.current = false;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current && !isPullingDown.current) return;
    pulling.current = false;
    const wasPulling = isPullingDown.current;
    isPullingDown.current = false;
    pullDirectionChecked.current = false;

    if (!wasPulling) {
      setPullDistance(0);
      setStatus(STATUS.IDLE);
      return;
    }

    const overThreshold = pullDistance >= THRESHOLD;
    if (overThreshold) {
      if (externalRefreshing === undefined) setStatus(STATUS.REFRESHING);
      setPullDistance(40);
      triggerHaptic('submit');
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

  /* After the refreshing state completes (external or internal), spring back to 0. */
  useEffect(() => {
    if (!isRefreshing && status !== STATUS.IDLE && externalRefreshing !== undefined) {
      setPullDistance(0);
      setStatus(STATUS.IDLE);
    }
  }, [isRefreshing, status, externalRefreshing]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        minHeight: '100%',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -40 + pullDistance,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 40,
          transform: `rotate(${Math.min(pullDistance / THRESHOLD, 1) * 360}deg)`,
          transition: pullDistance > 0 && !isRefreshing ? 'none' : 'top 0.4s var(--ease-spring), transform 0.4s var(--ease-spring)',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          gap: 8
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
          }}
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance > 0 && !isRefreshing
            ? 'none'
            : 'transform 0.4s var(--ease-spring)',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}

PullToRefresh.propTypes = {
  onRefresh: PropTypes.func,
  children: PropTypes.node,
  isRefreshing: PropTypes.bool
};
