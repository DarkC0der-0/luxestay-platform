import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useHostProperties, useDeleteProperty } from '@/features/properties/hooks/useProperties';
import { useHostReservations } from '@/features/bookings/hooks/useBookings';
import Modal from '@/shared/components/Modal';
import CreatePropertyForm from '@/features/properties/components/CreatePropertyForm';
import {
  FiHome,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import HostStatCard from '../components/HostStatCard';
import HostPropertyList from '../components/HostPropertyList';
import HostReservationList from '../components/HostReservationList';

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

const HostDashboardPage = () => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const { data: propertiesData, isLoading: propsLoading } = useHostProperties();
  const { data: reservationsData, isLoading: resLoading } = useHostReservations();
  const deleteMutation = useDeleteProperty();

  const properties = propertiesData?.properties || propertiesData?.data || [];
  const reservations = reservationsData?.bookings || reservationsData?.data || [];
  const loading = propsLoading || resLoading;

  /* Derived stats */
  const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.total_price || r.totalPrice || 0), 0);
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const pendingCount = reservations.filter((r) => r.status === 'pending').length;

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-50 pt-32 pb-20 px-6 flex flex-col items-center">
        <div className="max-w-7xl w-full">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl animate-pulse mb-10" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-3xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-50 pt-28 pb-24 px-4 md:px-8">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-indigo-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] bg-violet-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '14s', animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <FadeIn delay={0}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <p className="text-indigo-500 text-xs font-black uppercase tracking-widest mb-1">Welcome back</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {user?.name?.split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage your listings, track reservations, and grow your hosting business.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 text-sm flex-shrink-0"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FiPlus className="w-4 h-4" />
              Add New Property
            </button>
          </div>
        </FadeIn>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <HostStatCard
            icon={FiHome}
            label="Total Listings"
            value={properties.length}
            sub="Active properties"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
            delay={60}
          />
          <HostStatCard
            icon={FiDollarSign}
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            sub="From all bookings"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={120}
          />
          <HostStatCard
            icon={FiCheckCircle}
            label="Confirmed"
            value={confirmedCount}
            sub="Active reservations"
            gradient="bg-gradient-to-br from-violet-500 to-purple-700"
            delay={180}
          />
          <HostStatCard
            icon={FiClock}
            label="Pending"
            value={pendingCount}
            sub="Awaiting confirmation"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={240}
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* MY PROPERTIES (3/5) */}
          <FadeIn delay={300} className="xl:col-span-3">
            <HostPropertyList
              properties={properties}
              onAddClick={() => setIsModalOpen(true)}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              deletingId={deletingId}
              onDeleteConfirm={handleDelete}
            />
          </FadeIn>

          {/* RESERVATIONS (2/5) */}
          <FadeIn delay={380} className="xl:col-span-2">
            <HostReservationList reservations={reservations} />
          </FadeIn>
        </div>
      </div>

      {/* ADD PROPERTY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Property"
        size="lg"
      >
        <CreatePropertyForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default HostDashboardPage;
