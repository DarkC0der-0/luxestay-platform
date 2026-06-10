import React from 'react';
import useScrollReveal from '@/shared/hooks/useScrollReveal';
import { FiGlobe, FiAward, FiHeart, FiShield } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import FeatureCard from '../components/FeatureCard';

const AboutPage = () => {
  const [missionRef, isMissionRevealed] = useScrollReveal();
  const [experienceRef, isExperienceRevealed] = useScrollReveal();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[320px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        <img 
          src="/about.jpg" 
          alt="About LuxeStay" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[ken-burns_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/20 to-slate-950/40" />
        
        <div className="relative z-10 text-center px-6 mt-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 shadow-2xl mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
            Redefining <br/> <span className="text-indigo-300">Luxury Travel</span>
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className={`max-w-4xl mx-auto px-6 py-12 md:py-24 text-center opacity-0 ${isMissionRevealed ? 'animate-fade-in-up' : ''}`}>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
          We believe that where you stay <br className="hidden md:block" /> should be as extraordinary as where you travel.
        </h2>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">
          LuxeStay is a premier property rental platform specializing in high-end villas and exclusive vacation homes. Our mission is to connect discerning travelers with extraordinary spaces, ensuring a seamless and luxurious experience from booking to check-out.
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-200 py-12 md:py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          <StatCard number="10K+" label="Happy Guests" delay="delay-100" />
          <StatCard number="500+" label="Luxury Properties" delay="delay-200" />
          <StatCard number="50+" label="Destinations" delay="delay-300" />
          <StatCard number="24/7" label="Concierge Support" delay="delay-400" />
        </div>
      </section>
 
      {/* The Experience Section */}
      <section ref={experienceRef} className={`max-w-7xl mx-auto px-6 py-12 md:py-24 opacity-0 ${isExperienceRevealed ? 'animate-fade-in-up' : ''}`}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">The LuxeStay Experience</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Discover what sets us apart from ordinary vacation rentals.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={FiAward} 
            title="Curated Selection" 
            description="Every property in our portfolio is meticulously vetted for design, location, and luxury amenities to ensure an unforgettable stay."
            delay="delay-100"
          />
          <FeatureCard 
            icon={FiShield} 
            title="Seamless Booking" 
            description="Our intuitive platform and secure payment process make securing your dream vacation home effortless and worry-free."
            delay="delay-200"
          />
          <FeatureCard 
            icon={FiHeart} 
            title="Personalized Service" 
            description="From private chefs to bespoke itineraries, our dedicated concierge team is available to craft your perfect getaway."
            delay="delay-300"
          />
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
