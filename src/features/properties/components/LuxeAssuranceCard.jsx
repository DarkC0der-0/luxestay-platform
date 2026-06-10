import React from 'react';

const LuxeAssuranceCard = () => {
  return (
    <div className="mt-8 p-8 bg-indigo-900 rounded-[32px] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <h4 className="text-xl font-black mb-4 relative z-10">Luxe Assurance</h4>
      <ul className="space-y-4 relative z-10">
        <li className="flex items-start gap-3">
          <div className="mt-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
             <svg className="w-2.5 h-2.5 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <span className="text-sm font-bold text-white/80">Identity Verified Host</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
             <svg className="w-2.5 h-2.5 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <span className="text-sm font-bold text-white/80">Premium Quality Check</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
             <svg className="w-2.5 h-2.5 text-indigo-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <span className="text-sm font-bold text-white/80">24/7 Concierge Support</span>
        </li>
      </ul>
    </div>
  );
};

export default LuxeAssuranceCard;
