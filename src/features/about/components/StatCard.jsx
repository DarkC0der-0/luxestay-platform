import React from 'react';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const StatCard = ({ number, label, delay }) => {
  const [ref, isRevealed] = useScrollReveal();
  return (
    <div ref={ref} className={`text-center opacity-0 ${isRevealed ? `animate-fade-in-up ${delay}` : ''}`}>
      <div className="text-5xl md:text-6xl font-black text-indigo-600 mb-2">{number}</div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
};

export default StatCard;
