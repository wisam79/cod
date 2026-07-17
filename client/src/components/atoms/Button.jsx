import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ children, variant = 'primary', size = 'md', type = 'button', disabled, onClick, style, className = '', ...rest }) {
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '0.75rem', height: '38px', minHeight: '38px' },
    md: {},
    lg: { padding: '14px 28px', fontSize: '0.9375rem', height: '48px', minHeight: '48px' }
  };

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variantClass[variant] || 'btn-primary'} ${className}`}
      style={{ ...sizeStyles[size], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};

