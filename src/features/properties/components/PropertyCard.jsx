import React from 'react';
import { Link } from 'react-router-dom';
import { RxDot } from 'react-icons/rx';
import { IoIosPeople } from 'react-icons/io';
import { FaBed } from 'react-icons/fa';
import { FaBath } from 'react-icons/fa6';

const PropertyCard = ({ property }) => {
  return (
    <Link 
      to={`/properties/${property.id || property._id}`} 
      className="group block bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
        <img 
          src={property.image_urls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' }}
        />
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50">
          <span className="text-indigo-600 font-black text-sm">${property.price_per_night || property.pricePerNight}</span>
          <span className="text-slate-400 text-[10px] font-black uppercase ml-1 tracking-tighter">/ Night</span>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mb-3">
          <span>{property.location}</span>
          <RxDot className="mx-1.5 opacity-50" />
          <span className="text-slate-400">{property.property_type || 'Luxury Residence'}</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-6 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300">
          {property.title}
        </h3>
        
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
          <div className="flex flex-col items-center">
            <IoIosPeople className="text-xl text-slate-300 mb-1" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{property.max_guests || 4} Guests</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-50">
            <FaBed className="text-xl text-slate-300 mb-1" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{property.bedrooms || 2} Beds</span>
          </div>
          <div className="flex flex-col items-center">
            <FaBath className="text-xl text-slate-300 mb-1" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{property.bathrooms || 2} Baths</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
