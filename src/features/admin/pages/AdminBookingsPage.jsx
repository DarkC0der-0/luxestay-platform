import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/shared/lib/axios';
import Modal from '@/shared/components/Modal';
import { 
  FiCalendar, 
  FiUser, 
  FiHome, 
  FiDollarSign, 
  FiSearch, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiInfo 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);

  // Modal & Selection state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState(null);

  // Edit form state
  const [editStatus, setEditStatus] = useState('confirmed');

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/admin/bookings');
      if (data.success) {
        setBookings(data.data);
        setFilteredBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to load bookings', error);
      toast.error('Failed to retrieve bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = bookings.filter(
      (b) =>
        b.guest_name?.toLowerCase().includes(query) ||
        b.property_title?.toLowerCase().includes(query) ||
        b.status?.toLowerCase().includes(query)
    );
    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset page on query updates
  }, [searchQuery, bookings]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handlers
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setIsEditOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.patch(`/admin/bookings/${selectedBooking.id}/status`, { status: editStatus });
      if (data.success) {
        toast.success('Booking status updated successfully');
        setIsEditOpen(false);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleDeleteOpen = (id) => {
    setDeleteBookingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { data } = await apiClient.delete(`/admin/bookings/${deleteBookingId}`);
      if (data.success) {
        toast.success('Booking deleted successfully');
        setIsDeleteOpen(false);
        setDeleteBookingId(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to delete booking', error);
      toast.error('Failed to delete booking');
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Bookings</h2>
          <p className="text-slate-500 text-sm mt-1">Track reservation dates, client check-ins, payments, and statuses.</p>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <FiSearch className="text-base" />
          </span>
          <input
            type="text"
            placeholder="Search guest, property, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100/40 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50/70 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4.5 rounded-l-lg">Booking ID</th>
                <th className="px-6 py-4.5">Guest</th>
                <th className="px-6 py-4.5">Property</th>
                <th className="px-6 py-4.5">Stay Dates</th>
                <th className="px-6 py-4.5">Total Amount</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4.5 text-slate-500 font-mono text-xs">{booking.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4.5 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FiUser className="text-sm" />
                      </div>
                      {booking.guest_name}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <FiHome className="text-slate-400 text-sm" />
                      <span className="max-w-[180px] truncate">{booking.property_title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-indigo-400 text-sm" />
                      <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-900 font-extrabold">${Number(booking.total_price).toLocaleString()}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="p-1.5 bg-slate-100/50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="text-base" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(booking)}
                        className="p-1.5 bg-slate-100/50 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="Edit Booking"
                      >
                        <FiEdit2 className="text-base" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOpen(booking.id)}
                        className="p-1.5 bg-slate-100/50 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-500 transition-all cursor-pointer"
                        title="Delete Booking"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-medium">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-800 font-bold">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of <span className="text-slate-800 font-bold">{filteredBookings.length}</span> bookings
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details View Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Reservation Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Booking Status</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold capitalize shadow-sm ${
                  selectedBooking.status === 'confirmed' ? 'bg-emerald-500 text-white' :
                  selectedBooking.status === 'cancelled' ? 'bg-rose-500 text-white' : 
                  'bg-amber-500 text-white'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reference ID</span>
                <span className="text-xs font-mono font-bold text-slate-800">{selectedBooking.id.toUpperCase()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                    <FiUser className="text-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Guest Name</span>
                    <span className="text-sm font-bold text-slate-900">{selectedBooking.guest_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <FiHome className="text-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Property</span>
                    <span className="text-sm font-bold text-slate-900 line-clamp-1">{selectedBooking.property_title}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                    <FiCalendar className="text-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stay Period</span>
                    <span className="text-sm font-bold text-slate-900">{formatDate(selectedBooking.start_date)} - {formatDate(selectedBooking.end_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <FiDollarSign className="text-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Financials</span>
                    <span className="text-sm font-bold text-slate-900">Total: ${Number(selectedBooking.total_price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <FiInfo className="text-slate-400" />
                Created on: {new Date(selectedBooking.created_at).toLocaleString()}
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Edit Status Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modify Reservation Status"
        size="sm"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-5">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3 mb-2">
            <FiAlertCircle className="text-amber-600 text-xl flex-shrink-0" />
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              Updating the status will affect availability and notifications. 
              Only change status if you have verified the action.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 block">Current Status</label>
            <select 
              value={editStatus} 
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
            >
              <option value="pending">Pending Approval</option>
              <option value="confirmed">Confirmed / Paid</option>
              <option value="cancelled">Cancelled / Refunded</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <FiCheckCircle className="text-sm" /> Apply Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteBookingId(null);
        }}
        title="Confirm Booking Removal"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <FiTrash2 className="text-xl" />
          </div>
          
          <div>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Removing this reservation will permanently delete it from the system records. 
              <span className="block font-bold text-rose-600 mt-1.5 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                Warning: This action cannot be undone and might affect financial reports.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteBookingId(null);
              }}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
            >
              No, Keep Record
            </button>
            <button 
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              Yes, Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBookingsPage;
