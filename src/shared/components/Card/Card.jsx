import React from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Card Component
 * Features: Multi-layered soft shadows, smooth hover transitions, and optimized rounding.
 */
export const Card = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`
      bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500
      ${hoverEffect ? 'hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverEffect: PropTypes.bool,
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-8 pb-4 border-b border-slate-50 ${className}`}>
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-8 ${className}`}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-8 pt-4 border-t border-slate-50 bg-slate-50/50 ${className}`}>
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
