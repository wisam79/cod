import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// Deterministic gradient palette for initials fallback
const GRADIENTS = [
  ['#1e40af', '#3b82f6'],
  ['#1d4ed8', '#2563eb'],
  ['#0891b2', '#06b6d4'],
  ['#059669', '#10b981'],
  ['#d97706', '#f59e0b'],
  ['#dc2626', '#ef4444'],
  ['#db2777', '#ec4899'],
  ['#4f46e5', '#6366f1'],
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const [error, setError] = useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setError(false);
  }, [src]);

  const style = {
    sm: { width: '32px', height: '32px', borderRadius: '50%' },
    md: { width: '40px', height: '40px', borderRadius: '50%' },
    lg: { width: '64px', height: '64px', borderRadius: '50%' },
    xl: { width: '96px', height: '96px', borderRadius: '50%' }
  };

  const { gradient, initials } = useMemo(() => {
    const name = alt || '?';
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase() || '?';
    return { gradient: GRADIENTS[hashString(name) % GRADIENTS.length], initials };
  }, [alt]);

  const fontSize = { sm: 13, md: 16, lg: 24, xl: 36 }[size];

  return (src && !error) ? (
    <img 
      src={src} 
      alt={alt || 'avatar'} 
      style={style[size]}
      className={`avatar-img object-cover ${className}`}
      onError={() => setError(true)}
    />
  ) : (
    <div 
      style={{
        ...style[size],
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize,
        lineHeight: 1,
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
        userSelect: 'none'
      }}
      className={`avatar-fallback ${className}`}
      aria-label={alt}
      role="img"
    >
      {initials}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

