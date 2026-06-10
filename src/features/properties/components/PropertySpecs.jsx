import React from 'react';
import PropTypes from 'prop-types';
import { IoIosPeople } from 'react-icons/io';
import { FaBed } from 'react-icons/fa';
import { FaBath } from 'react-icons/fa6';

const PropertySpecs = ({ maxGuests, bedrooms, bathrooms }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch justify-between gap-2 sm:gap-0 p-6 sm:p-8 bg-white rounded-[32px] shadow-2xl border border-slate-100">
      <div className="flex-1 flex items-center space-x-4 text-slate-700 p-2 sm:p-0">
        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
          <IoIosPeople className="text-3xl" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Guests</div>
          <span className="font-bold text-xl">{maxGuests || 4}</span>
        </div>
      </div>
      
      <div className="hidden sm:block w-px h-12 bg-slate-100 self-center mx-6" />
      <div className="block sm:hidden h-px w-full bg-slate-50 my-2" />

      <div className="flex-1 flex items-center space-x-4 text-slate-700 p-2 sm:p-0">
        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
          <FaBed className="text-2xl" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Bedrooms</div>
          <span className="font-bold text-xl">{bedrooms || 2}</span>
        </div>
      </div>

      <div className="hidden sm:block w-px h-12 bg-slate-100 self-center mx-6" />
      <div className="block sm:hidden h-px w-full bg-slate-50 my-2" />

      <div className="flex-1 flex items-center space-x-4 text-slate-700 p-2 sm:p-0">
        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
          <FaBath className="text-2xl" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Bathrooms</div>
          <span className="font-bold text-xl">{bathrooms || 2}</span>
        </div>
      </div>
    </div>
  );
};

PropertySpecs.propTypes = {
  maxGuests: PropTypes.number,
  bedrooms: PropTypes.number,
  bathrooms: PropTypes.number,
};

export default PropertySpecs;
