import React, { useEffect, useState } from 'react';
import apiClient from '@/shared/lib/axios';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiArrowDownRight, 
  FiSearch, 
  FiRefreshCw, 
  FiDownload, 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiHome,
  FiActivity,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminFinancePage = () => {
  const [stats, setStats] = useState({
    summary: {
      total_volume: 0,
      total_refunds: 0,
      platform_fees: 0,
      pending_payouts: 0,
      completed_payouts: 0
    },
    chartData: []
  });
  const [payouts, setPayouts] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, month, year
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchFinanceData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, payoutsRes] = await Promise.all([
        apiClient.get('/admin/finance/stats'),
        apiClient.get('/admin/finance/payouts')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (payoutsRes.data.success) {
        setPayouts(payoutsRes.data.data);
        setFilteredPayouts(payoutsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load finance data', error);
      toast.error('Financial sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    let result = payouts;
    const query = searchQuery.toLowerCase();

    // Text search
    if (query) {
      result = result.filter(p => 
        p.host_name?.toLowerCase().includes(query) ||
        p.property_title?.toLowerCase().includes(query) ||
        p.id?.toLowerCase().includes(query)
      );
    }

    // Date filtering
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(p => {
        const date = new Date(p.created_at);
        if (dateFilter === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (dateFilter === 'year') return date.getFullYear() === now.getFullYear();
        return true;
      });
    }

    setFilteredPayouts(result);
    setCurrentPage(1);
  }, [searchQuery, dateFilter, payouts]);

  const handleMarkAsPaid = async (id) => {
    try {
      const { data } = await apiClient.patch(`/admin/finance/payouts/${id}/pay`);
      if (data.success) {
        toast.success('Payout marked as processed');
        fetchFinanceData();
      }
    } catch (error) {
      toast.error('Failed to update payout status');
    }
  };

  const handleRefund = async (bookingId) => {
    const confirm = window.confirm('Are you sure you want to issue a full refund and cancel this booking?');
    if (!confirm) return;

    toast.loading('Reversing transaction...', { id: 'refund-toast' });
    try {
      const { data } = await apiClient.post(`/admin/finance/refund/${bookingId}`);
      if (data.success) {
        toast.success('Refund processed successfully', { id: 'refund-toast' });
        fetchFinanceData();
      }
    } catch (error) {
      toast.error('Refund failed', { id: 'refund-toast' });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Host', 'Property', 'Host Share', 'Platform Fee', 'Status'];
    const rows = filteredPayouts.map(p => [
      p.id,
      new Date(p.created_at).toLocaleDateString(),
      p.host_name,
      p.property_title,
      p.amount,
      p.platform_fee,
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LUXESTAY_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported');
  };

  // Simple SVG Bar Chart Logic
  const maxVal = Math.max(...stats.chartData.map(d => Number(d.amount)), 1);
  
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayouts = filteredPayouts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Synchronizing financial ledger...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Treasury</h2>
          <p className="text-slate-500 text-sm mt-1">Management of platform fees, host payouts, and transactional auditing.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <FiDownload className="text-sm" /> Export CSV
          </button>
          <button 
            onClick={fetchFinanceData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95"
          >
            <FiRefreshCw className="text-lg" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm glow-emerald">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
            <FiTrendingUp className="text-lg" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-950">${Number(stats.summary.platform_fees || 0).toLocaleString()}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Platform Earnings</span>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm glow-indigo">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 font-bold">
            <FiClock className="text-lg" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-950">${Number(stats.summary.pending_payouts || 0).toLocaleString()}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Pending Payouts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm glow-violet">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 font-bold">
            <FiCheckCircle className="text-lg" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-950">${Number(stats.summary.completed_payouts || 0).toLocaleString()}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Total Paid to Hosts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm glow-rose">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 font-bold">
            <FiArrowDownRight className="text-lg" />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-slate-950">${Number(stats.summary.total_refunds || 0).toLocaleString()}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Reversed Volume</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Velocity</h3>
              <p className="text-[11px] text-slate-400 font-medium">Monthly platform fee growth</p>
            </div>
            <FiActivity className="text-indigo-500" />
          </div>

          <div className="flex-1 flex items-end gap-3 h-48 px-2 pt-4 bg-slate-50/50 rounded-xl mb-2">
            {stats.chartData.map((d, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group cursor-help">
                <div className="w-full bg-slate-100 rounded-t-lg h-full relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-500 rounded-t-lg shadow-[0_-4px_12px_rgba(79,70,229,0.2)]"
                    style={{ height: `${(Number(d.amount) / maxVal) * 100}%` }}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1/4 bg-white/20 rounded-full blur-[1px]"></div>
                  </div>
                  
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl transform group-hover:-translate-y-1">
                    ${Number(d.amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{d.month}</span>
              </div>
            ))}
            {stats.chartData.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-medium italic">No growth data yet</div>
            )}
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-900">Earnings Ledger</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Host or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none transition-all w-40 sm:w-48"
                />
              </div>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50/50 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">Earnings</th>
                  <th className="px-6 py-3.5">Fee</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {currentPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <FiUser className="text-slate-400" /> {p.host_name}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <FiHome /> {p.property_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">${Number(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">${Number(p.platform_fee).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending' && (
                          <button 
                            onClick={() => handleMarkAsPaid(p.id)}
                            className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-600 transition-all active:scale-95"
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleRefund(p.booking_id)}
                            className="px-2.5 py-1.5 border border-rose-100 text-rose-600 rounded-lg font-bold text-[10px] hover:bg-rose-50 transition-all active:scale-95"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayouts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">No ledger records found for this criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-30 cursor-pointer text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinancePage;
