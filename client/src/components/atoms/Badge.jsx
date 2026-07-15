import React from 'react';
import PropTypes from 'prop-types';

export default function Badge({ type, content, className = '' }) {
  return (
    <span className={`badge badge-${type || 'default'} ${className}`}>
      {content}
    </span>
  );
}

Badge.propTypes = {
  type: PropTypes.string,
  content: PropTypes.node.isRequired,
  className: PropTypes.string
};

