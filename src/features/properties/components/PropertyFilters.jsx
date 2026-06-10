import React from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiDollarSign } from 'react-icons/fi';
import Button from '@/shared/components/Button';

const PropertyFilters = ({ location, minPrice, maxPrice, onUpdateParam, onClearFilters }) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0 p-6 md:p-8 bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white/20 mb-16 animate-fade-in-up delay-200">
      
      <div className="flex-1 px-4">
        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 ml-1">Location</label>
        <div className="relative flex items-center group">
          <FiSearch className="absolute left-0 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Where to?"
            className="w-full pl-7 py-2 bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
            value={location}
            onChange={(e) => onUpdateParam('location', e.target.value)}
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-slate-100 self-center mx-4" />
      <div className="block md:hidden h-px w-full bg-slate-50 my-2" />

      <div className="flex-1 px-4">
        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 ml-1">Min Price</label>
        <div className="relative flex items-center group">
          <FiDollarSign className="absolute left-0 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="number"
            placeholder="Min Budget"
            className="w-full pl-7 py-2 bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
            value={minPrice}
            onChange={(e) => onUpdateParam('minPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-slate-100 self-center mx-4" />
      <div className="block md:hidden h-px w-full bg-slate-50 my-2" />

      <div className="flex-1 px-4">
        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 ml-1">Max Price</label>
        <div className="relative flex items-center group">
          <FiDollarSign className="absolute left-0 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="number"
            placeholder="Max Budget"
            className="w-full pl-7 py-2 bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
            value={maxPrice}
            onChange={(e) => onUpdateParam('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-12 bg-slate-100 self-center mx-4" />
      <div className="block md:hidden h-px w-full bg-slate-50 my-2" />

      <div className="flex-[0.6] px-4 flex items-end pb-1 md:pb-0">
        <Button 
          variant="outline"
          className="w-full !rounded-2xl py-3 bg-slate-50 border-slate-100 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300"
          onClick={onClearFilters}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Clear All</span>
        </Button>
      </div>
    </div>
  );
};

PropertyFilters.propTypes = {
  location: PropTypes.string.isRequired,
  minPrice: PropTypes.string.isRequired,
  maxPrice: PropTypes.string.isRequired,
  onUpdateParam: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default PropertyFilters;
