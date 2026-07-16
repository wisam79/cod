import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  className = '',
  label = '',
  rows = 3
}, ref) {
  return (
    <div className={`custom-input-wrapper ${className}`}>
      {label && <label className="custom-input-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          className="custom-input-element"
        />
      ) : (
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="custom-input-element"
        />
      )}
    </div>
  );
});

export default Input;

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  name: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
  rows: PropTypes.number
};

