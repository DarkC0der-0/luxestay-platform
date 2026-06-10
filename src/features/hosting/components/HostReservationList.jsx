import React from 'react';
import PropTypes from 'prop-types';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import StatusPill from './StatusPill';

const HostReservationList = ({ reservations }) => {
  return (
    <div className="relative bg-white/75 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-slate-200/60 overflow-hidden h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 px-7 pt-7 pb-5 border-b border-slate-100/80">
        <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <FiCalendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Reservations</h2>
          <p className="text-slate-400 text-xs">{reservations.length} total booking{reservations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* List */}
      <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto no-scrollbar">
        {reservations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No reservations yet</p>
            <p className="text-slate-400 text-xs mt-1">Guests will appear here once they book.</p>
          </div>
        ) : (
          reservations.map((res) => {
            const checkIn = new Date(res.start_date || res.startDate || res.check_in);
            const checkOut = new Date(res.end_date || res.endDate || res.check_out);
            const guestName = res.user?.name || res.guest?.name || 'Guest';
            const price = Number(res.total_price || res.totalPrice || 0);

            return (
              <div
                key={res.id || res._id}
                className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-100 hover:border-violet-100 hover:shadow-sm transition-all duration-200"
              >
                {/* Guest + Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                      {guestName[0]?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{guestName}</p>
                      <p className="text-[10px] text-slate-400">
                        {res.property?.title || 'Property'}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={res.status} />
                </div>

                {/* Dates + Price */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {isNaN(checkIn.getTime()) ? '—' : format(checkIn, 'MMM d')}
                      {' → '}
                      {isNaN(checkOut.getTime()) ? '—' : format(checkOut, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">
                    ${price.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

HostReservationList.propTypes = {
  reservations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      start_date: PropTypes.string,
      startDate: PropTypes.string,
      check_in: PropTypes.string,
      end_date: PropTypes.string,
      endDate: PropTypes.string,
      check_out: PropTypes.string,
      total_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      user: PropTypes.shape({
        name: PropTypes.string,
      }),
      guest: PropTypes.shape({
        name: PropTypes.string,
      }),
      property: PropTypes.shape({
        title: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default HostReservationList;
