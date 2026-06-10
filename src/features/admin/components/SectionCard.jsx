import React from 'react';
import PropTypes from 'prop-types';

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

SectionCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default SectionCard;
