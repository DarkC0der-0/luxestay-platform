import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCreateBooking, usePropertyAvailability } from '@/features/bookings/hooks/useBookings';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/Button';
import { FiCalendar, FiMessageSquare } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, parseISO } from 'date-fns';

const BookingWidget = ({ property }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  
  const propertyId = property.id || property._id;
  const { data: availabilityData } = usePropertyAvailability(propertyId);
  const createMutation = useCreateBooking();

  const pricePerNight = parseFloat(property.price_per_night || property.pricePerNight || 0);

  // Transform availability data into intervals for react-datepicker
  const excludedIntervals = useMemo(() => {
    const intervals = availabilityData?.availability || availabilityData?.data || [];
    return intervals.map(range => ({
      start: parseISO(range.check_in || range.startDate),
      end: parseISO(range.check_out || range.endDate)
    }));
  }, [availabilityData]);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    createMutation.mutate({
      property_id: propertyId,
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
      total_price: calculateDays() * pricePerNight
    }, {
      onSuccess: () => {
        setCheckIn(null);
        setCheckOut(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-6 sm:p-8 transform transition-all hover:shadow-slate-300">
      <div className="flex justify-between items-end mb-8 text-left">
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-1">Price</span>
          <span className="text-4xl font-black text-slate-900">${pricePerNight} <span className="text-sm font-bold text-slate-400">/ night</span></span>
        </div>
      </div>

      <form onSubmit={handleBooking} className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Check-in</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (checkOut && date >= checkOut) setCheckOut(null);
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              excludeDateIntervals={excludedIntervals}
              placeholderText="Select date"
              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              required
            />
          </div>
          <div className="h-px bg-slate-200 mx-1" />
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Check-out</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
              excludeDateIntervals={excludedIntervals}
              placeholderText="Select date"
              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              required
              disabled={!checkIn}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          className="w-full !rounded-2xl py-5"
          isLoading={createMutation.isPending}
          disabled={!checkIn || !checkOut}
          leftIcon={<FiCalendar className="text-xl" />}
        >
          Reserve Stay
        </Button>

        <Button 
          type="button"
          variant="outline"
          size="lg"
          className="w-full !rounded-2xl py-5 bg-slate-50 border-slate-100 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 group"
          onClick={() => {
            if (!token) {
              navigate('/login');
            } else {
              navigate('/messages');
            }
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <FiMessageSquare className="text-xl text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Message Host</span>
          </div>
        </Button>

        {checkIn && checkOut && (
          <div className="pt-6 border-t border-slate-100 mt-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total for {calculateDays()} nights</span>
              <span className="text-2xl font-black text-indigo-600">${(calculateDays() * pricePerNight).toFixed(2)}</span>
            </div>
            <div className="text-green-500 font-bold text-[10px] uppercase tracking-tighter bg-green-50 px-2 py-1 rounded-md">
              Secure Booking
            </div>
          </div>
        )}
      </form>
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
        .react-datepicker {
          font-family: inherit;
          border-radius: 1.5rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
          overflow: hidden;
          z-index: 50 !important;
        }
        .react-datepicker-popper {
          z-index: 100 !important;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #f1f5f9;
          padding-top: 1rem;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--in-selecting-range, 
        .react-datepicker__day--in-range {
          background-color: #4f46e5 !important;
          border-radius: 0.5rem;
        }
        .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
};

BookingWidget.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    price_per_night: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pricePerNight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default BookingWidget;
