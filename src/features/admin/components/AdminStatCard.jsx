import React from 'react';
import PropTypes from 'prop-types';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50/30 border-indigo-100/60',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
    glow: 'glow-indigo'
  },
  blue: {
    bg: 'bg-blue-50/30 border-blue-100/60',
    iconBg: 'bg-blue-500/10 text-blue-600',
    glow: 'glow-indigo'
  },
  emerald: {
    bg: 'bg-emerald-50/30 border-emerald-100/60',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    glow: 'glow-emerald'
  },
  violet: {
    bg: 'bg-violet-50/30 border-violet-100/60',
    iconBg: 'bg-violet-500/10 text-violet-600',
    glow: 'glow-violet'
  }
};

const AdminStatCard = ({ title, value, icon, color, delayClass }) => {
  const styles = colorMap[color] || colorMap.indigo;
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${styles.glow} animate-fade-in-up ${delayClass}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} mb-4 font-bold`}>
        {icon}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
          <span className="text-sm font-semibold text-slate-500 block mt-1">{title}</span>
        </div>
      </div>
    </div>
  );
};

AdminStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['indigo', 'blue', 'emerald', 'violet']),
  delayClass: PropTypes.string,
};

AdminStatCard.defaultProps = {
  color: 'indigo',
  delayClass: '',
};

export default AdminStatCard;
