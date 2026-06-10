import React from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiMessageSquare } from 'react-icons/fi';
import Button from '@/shared/components/Button';

const PropertyHostCard = ({ hostAvatar, hostName, onMessage }) => {
  return (
    <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300 border-2 border-slate-50 shadow-inner">
            {hostAvatar ? (
              <img 
                src={hostAvatar} 
                alt={hostName || 'Host'} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <FiUser size={40} />
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Your Host</div>
            <h3 className="text-3xl font-black text-slate-900">{hostName || 'Luxe Curator'}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verified Luxury Host</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="!rounded-2xl py-4 sm:px-10 bg-slate-50 border-slate-100 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 group"
          onClick={onMessage}
        >
          <div className="flex items-center justify-center gap-2">
            <FiMessageSquare className="text-xl text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Message Host</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

PropertyHostCard.propTypes = {
  hostAvatar: PropTypes.string,
  hostName: PropTypes.string,
  onMessage: PropTypes.func.isRequired,
};

export default PropertyHostCard;
