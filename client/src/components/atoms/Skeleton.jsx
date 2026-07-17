import React from 'react';
import PropTypes from 'prop-types';

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 'var(--radius-xs)',
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--border-light) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

SkeletonLine.propTypes = {
  width: PropTypes.string,
  height: PropTypes.number,
  style: PropTypes.object,
};

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--border-light) 50%, var(--bg-elevated) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonLine width="60%" height={12} />
          <SkeletonLine width="40%" height={8} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={`${80 - i * 15}%`} height={8} />
      ))}
    </div>
  );
}

SkeletonCard.propTypes = { lines: PropTypes.number };

export function SkeletonPage({ cards = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} lines={i === 0 ? 4 : 2} />
      ))}
    </div>
  );
}

SkeletonPage.propTypes = { cards: PropTypes.number };

export function SkeletonChat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
      {[80, 60, 70].map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
          {i % 2 === 0 && <SkeletonLine width="32px" height={32} style={{ borderRadius: '50%', flexShrink: 0 }} />}
          <SkeletonLine width={`${w}%`} height={40} style={{ borderRadius: 'var(--radius-md)' }} />
          {i % 2 !== 0 && <SkeletonLine width="32px" height={32} style={{ borderRadius: '50%', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}