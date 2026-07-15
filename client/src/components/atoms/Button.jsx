import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  className = '',
  style = {}
}) {
  const getStyles = () => {
    const base = {
      padding: '10px 20px',
      borderRadius: '16px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: disabled ? 0.6 : 1,
    };

    const variants = {
      primary: {
        backgroundColor: 'var(--primary)',
        color: '#ffffff',
        boxShadow: 'var(--shadow-sm)',
      },
      secondary: {
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
      },
      outline: {
        backgroundColor: 'transparent',
        border: '1.5px solid var(--primary)',
        color: 'var(--primary)',
      },
      danger: {
        backgroundColor: 'var(--danger-light, #ffebe6)',
        color: 'var(--danger, #ff3300)',
      },
      text: {
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        padding: '5px 10px',
      }
    };

    return { ...base, ...variants[variant], ...style };
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={getStyles()}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'text']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

