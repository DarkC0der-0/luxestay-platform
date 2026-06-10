import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@/shared/components/Modal';
import { 
  FiUser, FiCalendar, FiShield, FiActivity, FiHome, FiCreditCard, FiUserCheck, FiUserX, FiX
} from 'react-icons/fi';

const AdminUserProfileModal = ({
  isOpen,
  onClose,
  user,
  showAdminControls,
  onOpenRole,
  onToggleSuspension,
  onDelete,
}) => {
  const formatVal = (val) => {
    const n = Number(val);
    return isNaN(n) ? '0' : n.toLocaleString();
  };

  const formatDateSafe = (dateStr, options = {}) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, options);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Summary"
      size="lg"
    >
      {!user ? (
        <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Syncing User Data...</p>
        </div>
      ) : (
        <div className="space-y-6 text-left">
          {/* 1. Header Profile Summary Card */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold flex items-center justify-center text-xl shrink-0">
                {String(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{user.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                    user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    user.role === 'host' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                    'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    user.is_suspended 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {user.is_suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">{user.email}</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right shrink-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Since</span>
              <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">
                {formatDateSafe(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FiCreditCard className="text-lg" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Spend</span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">${formatVal(user?.analytics?.guest?.lifetimeSpend)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FiHome className="text-lg" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Owned Units</span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">{formatVal(user?.analytics?.host?.totalProperties)} Listings</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FiActivity className="text-lg" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue Impact</span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">${formatVal(user?.analytics?.host?.grossGenerated)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 3. Activity Feed */}
            <div className={showAdminControls ? 'lg:col-span-3 space-y-3' : 'lg:col-span-5 space-y-3'}>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Recent Activity</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                 {Array.isArray(user.analytics?.recentActivity) && user.analytics.recentActivity.length > 0 ? (
                   user.analytics.recentActivity.map((act, i) => (
                     <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all cursor-default">
                       <div className="flex items-center gap-3">
                         <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            {act.type === 'booking' ? <FiCreditCard size={13} /> : <FiHome size={13} />}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-700 leading-snug">{act.description}</p>
                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{formatDateSafe(act.created_at)}</p>
                         </div>
                       </div>
                       {act.val && <span className="text-xs font-extrabold text-indigo-600">${formatVal(act.val)}</span>}
                     </div>
                   ))
                 ) : (
                   <div className="py-10 text-center rounded-xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold">
                      No activity records found
                   </div>
                 )}
              </div>
            </div>

            {/* 4. Actions Panel */}
            {showAdminControls && (
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Administrative Controls</h4>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                   <button 
                     type="button"
                     onClick={() => onOpenRole(user)}
                     className="w-full py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                   >
                     <FiShield size={13} /> Adjust User Role
                   </button>
                   
                   <button 
                     type="button"
                     onClick={() => onToggleSuspension(user.id, user.is_suspended)}
                     className={`w-full py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                        user.is_suspended 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                     }`}
                   >
                     {user.is_suspended ? <FiUserCheck size={13} /> : <FiUserX size={13} />}
                     {user.is_suspended ? 'Reactivate Account' : 'Suspend Account'}
                   </button>

                   <div className="h-px bg-slate-200 my-2" />

                   <button 
                     type="button"
                     onClick={() => onDelete(user.id)}
                     className="w-full py-2 text-rose-500 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer text-center block border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl"
                   >
                     Terminate Account
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

AdminUserProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  showAdminControls: PropTypes.bool,
  onOpenRole: PropTypes.func,
  onToggleSuspension: PropTypes.func,
  onDelete: PropTypes.func,
};

AdminUserProfileModal.defaultProps = {
  showAdminControls: false,
};

export default AdminUserProfileModal;
