import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';

const DangerZone = ({ onDeleteClick }) => {
  return (
    <div className="relative bg-gradient-to-br from-rose-50/80 to-red-50/60 backdrop-blur-xl rounded-3xl border border-rose-200/60 shadow-xl shadow-rose-100/40 overflow-hidden p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <FiAlertCircle className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-rose-900 tracking-tight">Danger Zone</h2>
          <p className="text-rose-500/70 text-xs mt-0.5">These actions are permanent and cannot be undone</p>
        </div>
      </div>

      <div className="bg-white/60 rounded-2xl border border-rose-100 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">Delete Account</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-sm">
              Permanently remove your account and all associated data. This will erase your booking history, messages, and profile information.
            </p>
          </div>
          <button
            onClick={onDeleteClick}
            className="flex-shrink-0 flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 text-sm"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

DangerZone.propTypes = {
  onDeleteClick: PropTypes.func.isRequired,
};

export default DangerZone;
