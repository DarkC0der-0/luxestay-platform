import React from 'react';
import PropTypes from 'prop-types';

const ToggleRow = ({ label, description, value, onChange, dangerOn }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none active:scale-95 ${value ? (dangerOn ? 'bg-rose-500' : 'bg-indigo-600') : 'bg-slate-200'}`}
      aria-pressed={value}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

ToggleRow.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  dangerOn: PropTypes.bool,
};

ToggleRow.defaultProps = {
  dangerOn: false,
};

export default ToggleRow;
