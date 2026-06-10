import React from 'react';
import { FiStar, FiShield, FiClock, FiKey } from 'react-icons/fi';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const features = [
  {
    id: 1,
    icon: <FiStar className="w-6 h-6 text-indigo-600" />,
    title: 'Handpicked Luxury',
    description: 'Every property is meticulously vetted by our team to ensure it meets the highest standards of luxury and comfort.'
  },
  {
    id: 2,
    icon: <FiClock className="w-6 h-6 text-indigo-600" />,
    title: '24/7 Concierge',
    description: 'Our dedicated concierge team is available around the clock to cater to your every need during your stay.'
  },
  {
    id: 3,
    icon: <FiShield className="w-6 h-6 text-indigo-600" />,
    title: 'Secure Booking',
    description: 'Your payments and personal information are protected with enterprise-grade security and encryption.'
  },
  {
    id: 4,
    icon: <FiKey className="w-6 h-6 text-indigo-600" />,
    title: 'Seamless Check-in',
    description: 'Enjoy a frictionless arrival experience with digital access and personalized welcomes at every property.'
  }
];

const FeaturesSection = () => {
  const [ref, isRevealed] = useScrollReveal();

  return (
    <section ref={ref} className={`px-6 py-12 md:py-24 bg-white opacity-0 ${isRevealed ? 'animate-fade-in-up' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">The Assess Difference</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Why Choose Us
          </h2>
          <p className="text-slate-500 mt-4 font-medium text-lg">
            We redefine luxury travel by offering unparalleled service, exclusive properties, and a booking experience designed for peace of mind.
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {features.map((feature) => (
            <div key={feature.id} className="p-6 sm:p-8 rounded-[30px] bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-300 text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
