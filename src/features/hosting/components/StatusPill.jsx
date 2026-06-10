import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const StatusPill = ({ status }) => {
  const map = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: FiCheckCircle },
    pending:   { color: 'bg-amber-50  text-amber-700  border-amber-100',  icon: FiClock        },
    cancelled: { color: 'bg-rose-50   text-rose-700   border-rose-100',   icon: FiXCircle      },
    completed: { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: FiCheckCircle  },
  };
  const cfg = map[status?.toLowerCase()] ?? map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
};

StatusPill.propTypes = {
  status: PropTypes.string,
};

export default StatusPill;
