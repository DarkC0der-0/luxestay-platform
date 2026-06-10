import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

const CancelTripModal = ({ booking, onConfirm, onClose, isLoading }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up">
        
        <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <FiAlertTriangle className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Cancel Reservation?</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          Are you sure you want to cancel your stay at <strong className="text-slate-800">"{booking.property?.title}"</strong>?
          This action is irreversible. The host will be notified immediately, and refunds will be processed based on cancellation policy.
        </p>

        <div className="bg-rose-50/50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs flex gap-2.5 items-start mb-6">
          <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>
            Payout allocations to the host will be cancelled automatically, and logs will update in the admin ledger.
          </span>
        </div>

        <div className="flex justify-end gap-3.5">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            No, Keep Trip
          </button>
          
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-rose-100 hover:shadow-rose-200 active:scale-95 transition-all text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};

CancelTripModal.propTypes = {
  booking: PropTypes.shape({
    property: PropTypes.shape({
      title: PropTypes.string,
    }),
  }),
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CancelTripModal;
