import React from 'react';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Frequent Traveler',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
    content: "The easiest booking experience I've ever had. The property in Paris exceeded all expectations, and the 24/7 concierge was incredibly helpful in securing dinner reservations."
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Business Executive',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    content: "When traveling for business, I need reliability and comfort. Assess provides consistently high-quality properties that feel like a true home away from home."
  },
  {
    id: 3,
    name: 'Emma & James',
    role: 'Honeymooners',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
    content: "We booked our honeymoon villa in the Maldives through Assess. The attention to detail, the seamless check-in, and the stunning location made it an unforgettable trip."
  }
];

const Testimonials = () => {
  const [ref, isRevealed] = useScrollReveal();

  return (
    <section ref={ref} className={`px-6 py-12 md:py-24 bg-slate-50 opacity-0 ${isRevealed ? 'animate-fade-in-up' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div className="max-w-xl text-left">
            <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Guest Experiences</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Don't Just Take Our Word
            </h2>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 sm:p-8 rounded-[32px] md:rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative text-left">
              <div className="text-6xl text-indigo-100 font-serif absolute top-4 left-4 sm:top-6 sm:left-6 leading-none">"</div>
              <p className="text-slate-600 font-medium leading-relaxed relative z-10 mt-6 mb-8 text-lg">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-50"
                />
                <div>
                  <h4 className="font-black text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm font-medium text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
