import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '@/shared/lib/axios';
import { FiInbox, FiHelpCircle } from 'react-icons/fi';
import TripCard from '../components/TripCard';
import TripTabs from '../components/TripTabs';
import CancelTripModal from '../components/CancelTripModal';
import SupportTicketModal from '../components/SupportTicketModal';

const GuestTripsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  
  // Modals state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [supportBooking, setSupportBooking] = useState(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [submittingSupport, setSubmittingSupport] = useState(false);
  
  // Support Form state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState('General');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/bookings/my-bookings');
      setBookings(data.bookings || data.data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      toast.error('Failed to load your trips. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Filter bookings into tabs
  const now = new Date();
  const upcomingTrips = bookings.filter((b) => {
    const checkOut = new Date(b.endDate || b.check_out);
    return b.status !== 'cancelled' && checkOut >= now;
  });

  const pastAndCancelledTrips = bookings.filter((b) => {
    const checkOut = new Date(b.endDate || b.check_out);
    return b.status === 'cancelled' || checkOut < now;
  });

  const displayedTrips = activeTab === 'upcoming' ? upcomingTrips : pastAndCancelledTrips;

  // Handle Cancellation
  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setSubmittingCancel(true);
    try {
      await apiClient.patch(`/bookings/${cancellingBooking.id}/cancel`);
      toast.success('Your reservation has been cancelled.');
      setCancellingBooking(null);
      fetchTrips(); // Reload dashboard data
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel reservation. Please contact support.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Handle Support Ticket Creation
  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      toast.error('Please fill in all support fields.');
      return;
    }
    setSubmittingSupport(true);
    try {
      const payload = {
        subject: supportSubject,
        message: supportMessage,
        category: supportCategory,
        priority: supportCategory === 'Refund' ? 'high' : 'medium'
      };
      await apiClient.post('/support', payload);
      toast.success('Support ticket created successfully. Our team will review it.');
      setSupportBooking(null);
      setSupportSubject('');
      setSupportMessage('');
      setSupportCategory('General');
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      toast.error('Failed to submit support ticket.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const openSupportModal = (booking) => {
    setSupportBooking(booking);
    setSupportSubject(`Booking Help: ${booking.property?.title || 'Trip'}`);
    setSupportMessage(`Hello Support,\n\nI need assistance with my reservation (Booking ID: ${booking.id}) at "${booking.property?.title || 'Property'}" checking in on ${new Date(booking.startDate || booking.check_in).toLocaleDateString()}.\n\n[Describe your issue here]`);
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Trips</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your luxury stays, messages, and trip support</p>
          </div>
          
          {/* General Support Ticket launcher */}
          <button
            onClick={() => openSupportModal({ id: 'N/A' })}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl shadow-sm hover:shadow active:scale-95 transition-all text-sm"
          >
            <FiHelpCircle className="w-4.5 h-4.5 text-indigo-500" />
            Support Help Center
          </button>
        </div>

        {/* Navigation Tabs */}
        <TripTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          upcomingCount={upcomingTrips.length}
          pastCount={pastAndCancelledTrips.length}
        />

        {/* Main List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : displayedTrips.length === 0 ? (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl text-center shadow-xl border border-slate-100/50 max-w-xl mx-auto my-6">
            <div className="bg-indigo-50 text-indigo-500 rounded-3xl p-5 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FiInbox className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No trips found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              {activeTab === 'upcoming' 
                ? 'Ready to pack your bags? Explore our handpicked luxury properties.'
                : 'You have no past or cancelled reservation records.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/properties" className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all inline-block active:scale-95 text-sm">
                Explore Properties
              </Link>
            )}
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTrips.map((booking) => (
              <TripCard
                key={booking.id}
                booking={booking}
                now={now}
                onOpenSupport={openSupportModal}
                onCancel={setCancellingBooking}
              />
            ))}
          </div>
        )}

      </div>

      {/* CANCELLATION WARNING CONFIRMATION MODAL */}
      <CancelTripModal
        booking={cancellingBooking}
        onConfirm={handleCancelBooking}
        onClose={() => setCancellingBooking(null)}
        isLoading={submittingCancel}
      />

      {/* SUPPORT HELP CENTER MODAL */}
      <SupportTicketModal
        booking={supportBooking}
        isOpen={!!supportBooking}
        category={supportCategory}
        onCategoryChange={setSupportCategory}
        subject={supportSubject}
        onSubjectChange={setSupportSubject}
        message={supportMessage}
        onMessageChange={setSupportMessage}
        onSubmit={handleCreateSupportTicket}
        onClose={() => setSupportBooking(null)}
        isLoading={submittingSupport}
      />

    </div>
  );
};

export default GuestTripsPage;
