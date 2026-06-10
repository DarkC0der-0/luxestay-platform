import React from 'react';
import PropTypes from 'prop-types';

const TripTabs = ({ activeTab, onTabChange, upcomingCount, pastCount }) => {
  return (
    <div className="flex border-b border-slate-200/80 mb-8 gap-6">
      <button
        onClick={() => onTabChange('upcoming')}
        className={`pb-4 text-base font-bold transition-all relative ${
          activeTab === 'upcoming' 
            ? 'text-indigo-600 font-black' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Upcoming Trips ({upcomingCount})
        {activeTab === 'upcoming' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fade-in"></span>
        )}
      </button>
      
      <button
        onClick={() => onTabChange('past')}
        className={`pb-4 text-base font-bold transition-all relative ${
          activeTab === 'past' 
            ? 'text-indigo-600 font-black' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Past & Cancelled ({pastCount})
        {activeTab === 'past' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fade-in"></span>
        )}
      </button>
    </div>
  );
};

TripTabs.propTypes = {
  activeTab: PropTypes.oneOf(['upcoming', 'past']).isRequired,
  onTabChange: PropTypes.func.isRequired,
  upcomingCount: PropTypes.number.isRequired,
  pastCount: PropTypes.number.isRequired,
};

export default TripTabs;
