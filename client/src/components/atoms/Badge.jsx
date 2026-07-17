import React from 'react';
import PropTypes from 'prop-types';

export default function Badge({ type, content, className = '' }) {
  const badgeClass = `badge badge-${type || 'default'} ${className}`.trim();
  return <span className={badgeClass}>{content}</span>;
}

Badge.propTypes = {
  type: PropTypes.string,
  content: PropTypes.node,
  className: PropTypes.string
};
