import React from 'react';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const [ref, isRevealed] = useScrollReveal();
  return (
    <div ref={ref} className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 opacity-0 text-left ${isRevealed ? `animate-fade-in-up ${delay}` : ''}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
        <Icon className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
