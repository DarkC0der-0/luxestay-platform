import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertCircle, FiX, FiTrash2 } from 'react-icons/fi';

const DeleteConfirmModal = ({
  isOpen,
  userEmail,
  deleteConfirmText,
  onConfirmTextChange,
  onClose,
  onDelete,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">

        {/* Modal header */}
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-rose-900 tracking-tight">Delete Account</h3>
              <p className="text-rose-400 text-xs">This is permanent and irreversible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-rose-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-100 transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            You are about to permanently delete the account for{' '}
            <strong className="text-slate-900">{userEmail}</strong>. All data including
            bookings, messages, and preferences will be erased.
          </p>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-700 space-y-1.5">
            <p className="font-bold">The following will be deleted:</p>
            <ul className="space-y-1 list-disc list-inside text-rose-600">
              <li>Your profile and account data</li>
              <li>All booking history</li>
              <li>All messages and conversations</li>
            </ul>
          </div>

          {/* Type "DELETE" to confirm */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Type <span className="text-rose-600 font-black">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-rose-50/50 border border-rose-200 focus:border-rose-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-100 text-sm text-slate-800 placeholder:text-rose-200 transition-all"
            />
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all active:scale-95 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={deleteConfirmText !== 'DELETE' || isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 text-sm disabled:pointer-events-none"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiTrash2 className="w-4 h-4" />}
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  userEmail: PropTypes.string.isRequired,
  deleteConfirmText: PropTypes.string.isRequired,
  onConfirmTextChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default DeleteConfirmModal;
