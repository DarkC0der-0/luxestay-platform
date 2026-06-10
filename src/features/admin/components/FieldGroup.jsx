import React from 'react';
import PropTypes from 'prop-types';

const FieldGroup = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 font-medium leading-snug italic">{hint}</p>}
  </div>
);

FieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default FieldGroup;
