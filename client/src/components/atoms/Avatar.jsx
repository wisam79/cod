import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const [error, setError] = useState(false);

  const style = {
    sm: { width: '32px', height: '32px', borderRadius: '50%' },
    md: { width: '40px', height: '40px', borderRadius: '50%' },
    lg: { width: '64px', height: '64px', borderRadius: '50%' },
    xl: { width: '96px', height: '96px', borderRadius: '50%' }
  };

  // Fallback if no avatar image
  const initial = alt ? alt.charAt(0) : '?';

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
        backgroundColor: '#ffd8cc',
        color: '#ff6633',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}
      className={`avatar-fallback ${className}`}
    >
      {initial}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

