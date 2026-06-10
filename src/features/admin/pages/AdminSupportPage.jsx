import React, { useState, useEffect } from 'react';
import { 
  FiMail, 
  FiCheckCircle, 
  FiSearch, 
  FiMessageSquare, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiX, 
  FiShield, 
  FiAlertCircle, 
  FiTag, 
  FiChevronRight,
  FiSend,
  FiFileText,
  FiTrash2,
  FiActivity,
  FiCreditCard,
  FiHome,
  FiInfo,
  FiUserCheck,
  FiUserX,
  FiEdit
} from 'react-icons/fi';
import apiClient from '@/shared/lib/axios';
import Modal from '@/shared/components/Modal';
import toast from 'react-hot-toast';
import AdminUserProfileModal from '../components/AdminUserProfileModal';

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Ticket Detail State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [isDetailLoading, setIsDetailDetailLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [activityType, setActivityType] = useState('reply'); // 'reply' or 'note'
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // User Intelligence Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/admin/support');
      if (data.success) {
        setTickets(data.data);
        setFilteredTickets(data.data);
      }
    } catch (error) {
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetail(null);
    setIsDetailDetailLoading(true);
    try {
      const { data } = await apiClient.get(`/admin/support/${ticket.id}`);
      if (data.success) {
        setTicketDetail(data.data);
      }
    } catch (error) {
      toast.error('Failed to load conversation history');
    } finally {
      setIsDetailDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = tickets;
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.name?.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query) ||
          t.subject?.toLowerCase().includes(query)
      );
    }
    setFilteredTickets(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, tickets]);

  const handleUpdateMetadata = async (metadata) => {
    const toastId = toast.loading('Syncing metadata...');
    try {
      const { data } = await apiClient.patch(`/admin/support/${selectedTicket.id}/metadata`, metadata);
      if (data.success) {
        toast.success('Ticket intelligence updated', { id: toastId });
        // Refresh local state
        setTicketDetail(prev => ({ ...prev, ...data.data }));
        setTickets(prev => prev.map(t => t.id === data.data.id ? { ...t, ...data.data } : t));
      }
    } catch (error) {
      console.error('Support Sync Error:', error);
      const msg = error.response?.data?.error?.message || error.message || 'Unknown error';
      toast.error(`Update Failed: ${msg}`, { id: toastId });
    }
  };

  const handleSendActivity = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingActivity(true);
    try {
      const { data } = await apiClient.post(`/admin/support/${selectedTicket.id}/activity`, {
        content: replyContent,
        type: activityType
      });
      if (data.success) {
        toast.success(activityType === 'reply' ? 'Reply sent to user' : 'Internal note saved');
        setReplyContent('');
        // Reload details to show new activity
        fetchTicketDetail(selectedTicket);
      }
    } catch (error) {
      toast.error('Failed to process submission');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket and all history?')) return;
    try {
      const { data } = await apiClient.delete(`/admin/support/${id}`);
      if (data.success) {
        toast.success('Ticket deleted');
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  // User Intelligence Integration helpers
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

  const openUserIntelligence = async (userId) => {
    if (!userId) return toast.error('User not registered on platform');
    setSelectedUser(null);
    setIsUserModalOpen(true);
    try {
      const { data } = await apiClient.get(`/admin/users/${userId}`);
      if (data.success) {
        setSelectedUser(data.data);
      }
    } catch (error) {
      toast.error('Failed to sync user intelligence');
      setIsUserModalOpen(false);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading helpdesk environment...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Intelligence</h2>
          <p className="text-slate-500 text-sm mt-1">Multi-admin ticketing suite with categorized management and audit logs.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter inbox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {['all', 'open', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                  statusFilter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Ticket List Table */}
        <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all duration-500 ${
          selectedTicket ? 'lg:col-span-1' : 'lg:col-span-3'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className={selectedTicket ? 'hidden' : 'table-header-group'}>
                <tr className="bg-slate-50/70 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4.5">Requester</th>
                  <th className="px-6 py-4.5">Core Subject</th>
                  <th className="px-6 py-4.5">Metadata</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => fetchTicketDetail(ticket)}
                    className={`cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs border border-slate-200">
                          {ticket.name?.[0]?.toUpperCase()}
                        </div>
                        <div className={selectedTicket ? 'hidden md:block' : ''}>
                          <span className="block text-slate-900 font-black leading-none">{ticket.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-1">{ticket.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4.5 ${selectedTicket ? 'hidden sm:table-cell' : ''}`}>
                      <p className="text-slate-700 font-black truncate max-w-[250px]">{ticket.subject}</p>
                    </td>
                    <td className={`px-6 py-4.5 ${selectedTicket ? 'hidden' : 'table-cell'}`}>
                       <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500 uppercase">{ticket.category}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            ticket.priority === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                          }`}>{ticket.priority}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4.5 text-center sm:text-left">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                       <FiChevronRight className={`inline-transition-all ${selectedTicket?.id === ticket.id ? 'text-indigo-600 rotate-90 md:rotate-0' : 'text-slate-300'}`} />
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold italic">No active requests found in queue</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && !selectedTicket && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
               <p className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages}</p>
               <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 rounded-lg border border-slate-200 bg-white shadow-sm active:scale-90 transition-all"><FiChevronRight className="rotate-180" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg border border-slate-200 bg-white shadow-sm active:scale-90 transition-all"><FiChevronRight /></button>
               </div>
            </div>
          )}
        </div>

        {/* Detailed Workspace Drawer */}
        {selectedTicket && (
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden animate-slide-in h-[calc(100vh-250px)] min-h-[600px]">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20">
                     {selectedTicket.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       <button 
                         onClick={() => openUserIntelligence(ticketDetail?.user_id)}
                         className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-tighter"
                       >
                         <FiUser size={10} /> View Intelligence Core
                       </button>
                       <span className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Opened {formatDateSafe(selectedTicket.created_at)}</span>
                    </div>
                  </div>
               </div>
               <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><FiX /></button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/30">
               {/* Original Message */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Original Request</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
               </div>

               {/* Activity Thread */}
               {isDetailLoading ? (
                 <div className="py-10 text-center animate-pulse text-slate-300 font-black uppercase text-[10px]">Syncing thread history...</div>
               ) : (
                 <div className="space-y-4">
                    {ticketDetail?.activities?.map((act, i) => (
                      <div key={i} className={`flex flex-col ${act.type === 'note' ? 'items-center' : 'items-start'}`}>
                         <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm border ${
                           act.type === 'note' 
                            ? 'bg-amber-50 border-amber-100 text-amber-800 text-xs italic' 
                            : 'bg-indigo-600 border-indigo-700 text-white'
                         }`}>
                           {act.type === 'note' && <div className="flex items-center gap-2 mb-2 font-black uppercase text-[8px] tracking-widest text-amber-600 opacity-60"><FiFileText /> Internal Admin Note</div>}
                           <p className="text-sm font-medium leading-relaxed">{act.content}</p>
                           <div className={`mt-2 flex items-center justify-between gap-10 text-[9px] font-black uppercase tracking-widest ${act.type === 'note' ? 'text-amber-500' : 'text-indigo-200'}`}>
                              <span>{act.admin_name || 'System'}</span>
                              <span>{formatDateSafe(act.created_at)}</span>
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Controls Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
               <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
                  <select 
                    value={ticketDetail?.category || 'General'} 
                    onChange={(e) => handleUpdateMetadata({ category: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 focus:outline-none cursor-pointer"
                  >
                     {['General', 'Refund', 'Technical', 'Account', 'Fraud'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    value={ticketDetail?.priority || 'medium'} 
                    onChange={(e) => handleUpdateMetadata({ priority: e.target.value })}
                    className={`border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase focus:outline-none cursor-pointer ${
                      ticketDetail?.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                     {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p} Priority</option>)}
                  </select>
                  <div className="h-4 w-px bg-slate-200 mx-2" />
                  <button 
                    onClick={() => handleUpdateMetadata({ status: ticketDetail?.status === 'resolved' ? 'open' : 'resolved' })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 ${
                      ticketDetail?.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {ticketDetail?.status === 'resolved' ? <FiActivity /> : <FiCheckCircle />}
                    {ticketDetail?.status === 'resolved' ? 'Reopen Ticket' : 'Mark Resolved'}
                  </button>
                  <button 
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all ml-auto active:scale-90"
                  >
                    <FiTrash2 size={16} />
                  </button>
               </div>

               {/* Reply Form */}
               <form onSubmit={handleSendActivity} className="space-y-3">
                  <div className="relative">
                    <textarea 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={activityType === 'reply' ? "Write a response to the user..." : "Add private note for admins..."}
                      className={`w-full min-h-[100px] p-4 rounded-2xl border text-sm font-medium focus:outline-none transition-all no-scrollbar ${
                        activityType === 'reply' ? 'bg-white border-slate-200 focus:border-indigo-500' : 'bg-amber-50/50 border-amber-200 focus:border-amber-400'
                      }`}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                       <button type="button" onClick={() => setActivityType('reply')} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activityType === 'reply' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Public Reply</button>
                       <button type="button" onClick={() => setActivityType('note')} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activityType === 'note' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Admin Note</button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                     <button 
                       type="submit" 
                       disabled={isSubmittingActivity || !replyContent.trim()}
                       className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 disabled:opacity-30 active:scale-95 transition-all"
                     >
                        <FiSend size={14} /> {activityType === 'reply' ? 'Send Reply' : 'Add Internal Note'}
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </div>

      {/* Reusable User Intelligence Modal */}
      <AdminUserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        showAdminControls={false}
      />
    </div>
  );
};

export default AdminSupportPage;
