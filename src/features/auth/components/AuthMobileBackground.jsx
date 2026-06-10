import React from 'react';

const AuthMobileBackground = () => {
  return (
    <div className="lg:hidden absolute inset-0 z-0 overflow-hidden">
      <img 
        src="/login.jpg" 
        alt="LuxeStay Background Mobile" 
        className="w-full h-full object-cover filter blur-lg scale-110 opacity-70"
      />
      <div className="absolute inset-0 bg-slate-950/80" />
    </div>
  );
};

export default AuthMobileBackground;
