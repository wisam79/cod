import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(function Input({ label, type = 'text', placeholder, value, onChange, required, min, style, className = '', ...rest }, ref) {
  const isTextarea = type === 'textarea';

  return (
    <div className={`custom-input-wrapper ${className}`.trim()} style={style}>
      {label && <label className="custom-input-label">{label}</label>}
      {isTextarea ? (
        <textarea
          ref={ref}
          className="custom-input-element"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={3}
          style={{ height: 'auto', minHeight: '80px', resize: 'vertical' }}
          {...rest}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          className="custom-input-element"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
          {...rest}
        />
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  min: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string
};

export default Input;
