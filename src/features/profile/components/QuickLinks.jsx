import React from 'react';
import PropTypes from 'prop-types';
import { FiHome, FiCalendar, FiLogOut, FiArrowRight } from 'react-icons/fi';

const QuickLinks = ({ role, onNavigate, onSignOut }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {role === 'host' ? (
        <button
          onClick={() => onNavigate('/hosting')}
          className="group flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FiHome className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">My Dashboard</p>
              <p className="text-xs text-slate-400">Manage listings & reservations</p>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </button>
      ) : (
        <button
          onClick={() => onNavigate('/trips')}
          className="group flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">My Trips</p>
              <p className="text-xs text-slate-400">View bookings & history</p>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </button>
      )}

      <button
        onClick={onSignOut}
        className="group flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all hover:border-rose-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
            <FiLogOut className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">Sign Out</p>
            <p className="text-xs text-slate-400">Log out of your account</p>
          </div>
        </div>
        <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );
};

QuickLinks.propTypes = {
  role: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
};

export default QuickLinks;
