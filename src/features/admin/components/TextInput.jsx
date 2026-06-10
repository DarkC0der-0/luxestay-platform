import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({ icon, type, value, onChange, onBlur, placeholder, required, readOnly, trailingIcon }) => (
  <div className="relative group">
    {icon && (
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors text-sm">
        {icon}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${trailingIcon ? 'pr-10' : 'pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-400 focus:outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
    />
    {trailingIcon && (
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailingIcon}</span>
    )}
  </div>
);

TextInput.propTypes = {
  icon: PropTypes.node,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  trailingIcon: PropTypes.node,
};

TextInput.defaultProps = {
  type: 'text',
  required: false,
  readOnly: false,
};

export default TextInput;
