import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiMessageSquare, FiHelpCircle, FiXCircle } from 'react-icons/fi';

const TripCard = ({ booking, now, onOpenSupport, onCancel }) => {
  const status = booking.status || 'confirmed';
  const checkInDate = new Date(booking.startDate || booking.check_in);
  const checkOutDate = new Date(booking.endDate || booking.check_out);
  
  // Determine display status dynamically
  const isPast = checkOutDate < now;
  let displayStatus = status;
  if (status === 'confirmed' && isPast) {
    displayStatus = 'completed';
  } else if (status === 'pending' && isPast) {
    displayStatus = 'cancelled';
  }
  
  // Conditional status styling
  let statusClass = '';
  if (displayStatus === 'completed') statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  else if (displayStatus === 'confirmed') statusClass = 'bg-indigo-50 text-indigo-700 border-indigo-100';
  else if (displayStatus === 'pending') statusClass = 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse';
  else statusClass = 'bg-rose-50 text-rose-700 border-rose-100';

  return (
    <div className="bg-white/90 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border border-slate-100/60 flex flex-col h-full">
      {/* Property Image Overlay */}
      <div className="h-48 bg-slate-200 relative overflow-hidden flex-shrink-0">
        <img 
          src={booking.property?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'} 
          alt="Property" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider shadow-sm ${statusClass}`}>
            {displayStatus}
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 line-clamp-1">
          {booking.property?.title || 'Luxury Retreat'}
        </h3>
        <p className="text-slate-400 text-xs font-medium flex items-center gap-1 mb-5">
          <FiMapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          {booking.property?.location || 'Stunning Location'}
        </p>

        {/* Check In & Out dates */}
        <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Check-in</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-indigo-500" />
              {checkInDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Check-out</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-indigo-500" />
              {checkOutDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="border-t border-slate-200/50 pt-2.5 flex justify-between items-baseline font-black text-slate-900">
            <span className="text-xs uppercase tracking-wider text-slate-400">Total Paid</span>
            <span className="text-lg text-indigo-600">${Number(booking.totalPrice || booking.total_price).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="mt-auto space-y-2.5">
          <div className="flex gap-2">
            <Link 
              to={`/messages?bookingId=${booking.id}`} 
              className="flex-grow flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-600 active:scale-95 transition-all text-xs"
            >
              <FiMessageSquare className="w-4 h-4" />
              Message Host
            </Link>
            
            <button 
              onClick={() => onOpenSupport(booking)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 p-3 rounded-xl active:scale-95 transition-all flex items-center justify-center"
              title="Contact Support"
            >
              <FiHelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Conditional cancellation action */}
          {status !== 'cancelled' && (
            <button
              onClick={() => onCancel(booking)}
              className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold py-2.5 rounded-xl transition-all text-xs active:scale-[0.98]"
            >
              <FiXCircle className="w-4 h-4" />
              Cancel Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

TripCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    check_in: PropTypes.string,
    check_out: PropTypes.string,
    totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    property: PropTypes.shape({
      image: PropTypes.string,
      title: PropTypes.string,
      location: PropTypes.string,
    }),
  }).isRequired,
  now: PropTypes.instanceOf(Date).isRequired,
  onOpenSupport: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TripCard;
