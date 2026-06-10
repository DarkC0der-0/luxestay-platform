import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiHome, FiPlus, FiMapPin, FiEye, FiTrash2 } from 'react-icons/fi';

const HostPropertyList = ({
  properties,
  onAddClick,
  confirmDeleteId,
  setConfirmDeleteId,
  deletingId,
  onDeleteConfirm,
}) => {
  return (
    <div className="relative bg-white/75 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-slate-200/60 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FiHome className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Properties</h2>
            <p className="text-slate-400 text-xs">{properties.length} active listing{properties.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 max-h-[520px] overflow-y-auto no-scrollbar">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiHome className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-4">No listings yet</p>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <FiPlus className="w-4 h-4" /> Create First Listing
            </button>
          </div>
        ) : (
          properties.map((prop) => {
            const propId = prop.id || prop._id;
            return (
              <div
                key={propId}
                className="group flex gap-4 items-center bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-sm">
                  <img
                    src={prop.image_urls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80'}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80'; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <FiMapPin className="w-3 h-3 flex-shrink-0" />
                    {prop.location}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-black text-indigo-600">
                      ${prop.price_per_night || prop.pricePerNight}
                      <span className="text-xs font-normal text-slate-400"> / night</span>
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {prop.property_type || prop.propertyType || 'Listing'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/properties/${propId}`}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all"
                    title="View listing"
                  >
                    <FiEye className="w-4 h-4" />
                  </Link>
                  
                  {confirmDeleteId === propId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDeleteConfirm(propId)}
                        disabled={deletingId === propId}
                        className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {deletingId === propId ? '...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(propId)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-all"
                      title="Delete listing"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

HostPropertyList.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      location: PropTypes.string,
      price_per_night: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      pricePerNight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      property_type: PropTypes.string,
      propertyType: PropTypes.string,
      image_urls: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onAddClick: PropTypes.func.isRequired,
  confirmDeleteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setConfirmDeleteId: PropTypes.func.isRequired,
  deletingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDeleteConfirm: PropTypes.func.isRequired,
};

export default HostPropertyList;
