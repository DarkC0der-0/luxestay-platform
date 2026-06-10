import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSidePanel = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:block lg:w-1/2 relative h-screen overflow-hidden">
      <img 
        src="/login.jpg" 
        alt="LuxeStay Luxury Interior" 
        className="w-full h-full object-cover scale-105 animate-[ken-burns_30s_infinite_alternate]"
      />
      {/* Cinematic Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/10" />
      
      {/* Brand Badge */}
      <div className="absolute top-12 left-16">
        <div 
          className="text-2xl font-black tracking-tighter cursor-pointer flex items-center group text-white"
          onClick={() => navigate('/')}
        >
          <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">LUXE</span>STAY
        </div>
      </div>
      
      {/* Floating Tagline Card */}
      <div className="absolute bottom-20 left-16 max-w-lg space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Exclusive Retreats</span>
        </div>
        <h2 className="text-5xl font-black text-white leading-tight">
          {title}
        </h2>
        <p className="text-slate-300 font-medium text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default AuthSidePanel;
