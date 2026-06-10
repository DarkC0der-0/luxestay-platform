import React from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Input Component
 * Features: Animated focus states, icon support, and standardized error messaging.
 */
const Input = ({ label, id, error, className = '', leftIcon, rightIcon, ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          className={`
            w-full transition-all duration-300 outline-none
            ${leftIcon ? 'pl-14' : 'pl-6'}
            ${rightIcon ? 'pr-14' : 'pr-6'}
            py-4 bg-slate-50 border-2 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300
            focus:bg-white focus:shadow-xl focus:shadow-indigo-50/50
            ${error 
              ? 'border-red-100 focus:border-red-500 bg-red-50/30' 
              : 'border-slate-50 focus:border-indigo-600'
            }
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 flex items-center animate-shake">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-2" />
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
};

export default Input;
