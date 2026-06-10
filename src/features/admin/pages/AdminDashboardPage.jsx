import React, { useEffect, useState } from 'react';
import apiClient from '@/shared/lib/axios';
import { FiUsers, FiHome, FiCreditCard, FiActivity, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminStatCard from '../components/AdminStatCard';


const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const fetchStats = async (showToast = false) => {
    try {
      const { data } = await apiClient.get('/admin/dashboard/stats');
      if (data.success) {
        setStats(data.data);
        if (showToast) toast.success('Dashboard metrics updated');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      if (showToast) toast.error('Failed to update metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshActivityLogs = async () => {
    setIsRefreshingLogs(true);
    await fetchStats(false);
    setIsRefreshingLogs(false);
    toast.success('Live activity feed updated');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading dashboard overview...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time statistics and analytics for platform operations.</p>
        </div>
        <button 
          onClick={() => fetchStats(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm"
        >
          <FiRefreshCw className="text-slate-500" /> Refresh Metrics
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<FiUsers className="text-xl" />} 
          color="indigo" 
          delayClass="delay-100"
        />
        <AdminStatCard 
          title="Total Properties" 
          value={stats.totalProperties} 
          icon={<FiHome className="text-xl" />} 
          color="blue" 
          delayClass="delay-200"
        />
        <AdminStatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={<FiActivity className="text-xl" />} 
          color="emerald" 
          delayClass="delay-300"
        />
        <AdminStatCard 
          title="Total Revenue" 
          value={`$${Number(stats.totalRevenue).toLocaleString()}`} 
          icon={<FiCreditCard className="text-xl" />} 
          color="violet" 
          delayClass="delay-400"
        />
      </div>
      
      {/* Table & Activity Timeline Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Recent Bookings Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden animate-fade-in-up delay-300">
          <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Latest Reservations</span>
          </div>
          <div className="p-6 overflow-x-auto flex-1">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400 pb-3">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stats.recentBookings && stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-800 font-semibold">{booking.guest_name}</td>
                    <td className="px-4 py-4 text-slate-500 max-w-[150px] truncate">{booking.property_title}</td>
                    <td className="px-4 py-4 text-emerald-600 font-bold">${Number(booking.total_price).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-400">No recent bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Log Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden animate-fade-in-up delay-300">
          <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">System Activity</h3>
            <button 
              onClick={refreshActivityLogs}
              disabled={isRefreshingLogs}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors py-1 px-2.5 hover:bg-slate-50 rounded-lg active:scale-95"
            >
              <FiRefreshCw className={isRefreshingLogs ? 'animate-spin' : ''} /> Refresh Logs
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="relative border-l border-slate-100 pl-6 space-y-6">
              {stats.recentActivities && stats.recentActivities.map((log, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline point indicator */}
                  <span className={`absolute -left-[31px] top-1 h-[9px] w-[9px] rounded-full ring-4 ring-white ${
                    log.type === 'user' ? 'bg-indigo-500' :
                    log.type === 'property' ? 'bg-emerald-500' :
                    log.type === 'booking' ? 'bg-violet-500' :
                    log.type === 'payout' ? 'bg-amber-500' :
                    log.type === 'setting' ? 'bg-rose-500' :
                    log.type === 'support' ? 'bg-sky-500' : 'bg-slate-400'
                  }`}></span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                      {log.message}
                    </p>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap self-start sm:self-center">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats.recentActivities || stats.recentActivities.length === 0) && (
                <p className="text-slate-400 text-sm font-medium">No recent activity logs recorded.</p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-semibold text-slate-500">Continuous backend logs sync is active.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
