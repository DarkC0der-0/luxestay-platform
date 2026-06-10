import React from 'react';
import PropTypes from 'prop-types';
import { FiMap } from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';

const PropertyMap = ({ location }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <FiMap className="text-xl" />
        </div>
        <h3 className="text-3xl font-black text-slate-900">Location</h3>
      </div>
      <div className="bg-white p-4 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="aspect-[21/9] bg-slate-100 rounded-[32px] relative flex items-center justify-center group overflow-hidden">
           {/* Placeholder for Map */}
           <div className="absolute inset-0 bg-indigo-50/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
                <FaMapMarkerAlt size={32} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">{location}</h4>
              <p className="text-slate-500 font-medium max-w-md">Detailed neighborhood guides and exact coordinates available upon booking confirmation.</p>
           </div>
           <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
            alt="Map Background"
           />
        </div>
      </div>
    </div>
  );
};

PropertyMap.propTypes = {
  location: PropTypes.string.isRequired,
};

export default PropertyMap;
