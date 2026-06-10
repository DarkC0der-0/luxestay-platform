import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthMobileLogo = () => {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden flex justify-center mb-8">
      <div 
        className="text-3xl font-black tracking-tighter cursor-pointer flex items-center group text-slate-900"
        onClick={() => navigate('/')}
      >
        <span className="text-indigo-600 group-hover:text-indigo-500 transition-colors">LUXE</span>STAY
      </div>
    </div>
  );
};

export default AuthMobileLogo;
