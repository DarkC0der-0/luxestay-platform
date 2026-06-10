import React from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Button Component
 * Features: Shimmer animation on hover, scaling on click, glassmorphism, and loading states.
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props 
}) => {
  const baseStyles = 'premium-button inline-flex items-center justify-center font-bold tracking-tight border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 group';
  
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 focus:ring-offset-2 focus:ring-2 focus:ring-indigo-500',
    secondary: 'bg-slate-900 text-white shadow-xl shadow-slate-950/20 hover:bg-slate-800 focus:ring-offset-2 focus:ring-2 focus:ring-slate-400',
    outline: 'border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50',
    ghost: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50',
    glass: 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-xl',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 focus:ring-offset-2 focus:ring-2 focus:ring-red-400'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-7 py-3.5 text-sm rounded-2xl',
    lg: 'px-10 py-5 text-base rounded-3xl'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Premium Shimmer Effect */}
      {!disabled && !isLoading && <span className="premium-button-shimmer" />}

      {/* Content wrapper */}
      <div className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        {leftIcon && <span className="mr-2.5 transition-transform duration-300 group-hover:-translate-x-1">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {rightIcon && <span className="ml-2.5 transition-transform duration-300 group-hover:translate-x-1">{rightIcon}</span>}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'glass', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
};

export default Button;
