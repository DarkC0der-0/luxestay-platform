import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const Section = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

export const GlassCard = ({ children, className = '' }) => (
  <div
    className={`relative bg-white/75 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-slate-200/60 overflow-hidden ${className}`}
  >
    {/* top-edge shine */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
    {children}
  </div>
);

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const CardHeader = ({ icon: Icon, title, subtitle, iconBg }) => (
  <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100/80">
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

CardHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  iconBg: PropTypes.string.isRequired,
};

export const StyledInput = ({ label, icon: Icon, type = 'text', rightSlot, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        {...props}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${
          rightSlot ? 'pr-12' : 'pr-4'
        } py-3.5 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-200`}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  </div>
);

StyledInput.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  type: PropTypes.string,
  rightSlot: PropTypes.node,
};
