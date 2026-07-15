import React from 'react';
import PropTypes from 'prop-types';

export default function Input({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  name, 
  required = false, 
  className = '', 
  label = '',
  rows = 3
}) {
  return (
    <div className={`custom-input-wrapper ${className}`}>
      {label && <label className="custom-input-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea
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
}

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

