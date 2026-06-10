import React from 'react';
import PropTypes from 'prop-types';
import { FiHelpCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const SupportTicketModal = ({
  booking,
  isOpen,
  category,
  onCategoryChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  onSubmit,
  onClose,
  isLoading,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up">
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center">
              <FiHelpCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Need Support Assistance?</h3>
              <p className="text-slate-400 text-xs font-semibold">Help Center Ticket Creation</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
          >
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Category Picker */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Category</label>
            <div className="flex gap-2.5 flex-wrap">
              {['General', 'Refund', 'Technical', 'Account'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
            <input
              type="text"
              placeholder="Ticket Subject"
              required
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Describe your issue</label>
            <textarea
              placeholder="Please describe what you need assistance with in detail..."
              required
              rows={6}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm transition-all placeholder:text-slate-400 text-slate-800 resize-none"
            />
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 text-indigo-700 p-3.5 rounded-2xl text-xs flex gap-2.5 items-start mt-2">
            <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
            <span>
              This ticket will be posted to the admin support center. You will receive updates as the administration reviews your request.
            </span>
          </div>

          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl active:scale-95 transition-all text-sm"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

SupportTicketModal.propTypes = {
  booking: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  category: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  subject: PropTypes.string.isRequired,
  onSubjectChange: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default SupportTicketModal;
