import React from 'react';
import useScrollReveal from '@/shared/hooks/useScrollReveal';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import Button from '@/shared/components/Button';
import ContactInfoCard from '../components/ContactInfoCard';

const ContactPage = () => {
  const [formRef, isFormRevealed] = useScrollReveal();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[320px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        <img 
          src="/contact.jpg" 
          alt="Contact LuxeStay" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[ken-burns_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/20 to-slate-950/40" />
        
        <div className="relative z-10 text-center px-6 mt-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 shadow-2xl mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">24/7 Concierge</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
            Let's <br/> <span className="text-indigo-300">Connect</span>
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="space-y-8">
            <div className="mb-8 md:mb-12 text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">We're Here to Help</h2>
              <p className="text-lg text-slate-500">Reach out to our dedicated concierge team for personalized assistance with your luxury travel arrangements.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <ContactInfoCard 
                icon={FiPhone} 
                title="Phone Support" 
                content="+1 (800) 555-LUXE" 
                subContent="Available 24/7 for urgent requests."
                delay="delay-100"
              />
              <ContactInfoCard 
                icon={FiMail} 
                title="Email Us" 
                content="support@luxestay.com" 
                subContent="We usually respond within 2 hours."
                delay="delay-200"
              />
              <ContactInfoCard 
                icon={FiMapPin} 
                title="Headquarters" 
                content="New York, NY" 
                subContent="One World Trade Center, Suite 4500"
                delay="delay-300"
              />
              <ContactInfoCard 
                icon={FiClock} 
                title="Global Hours" 
                content="Always Open" 
                subContent="Our global team operates round the clock."
                delay="delay-400"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div ref={formRef} className={`bg-white rounded-[40px] p-6 sm:p-10 shadow-2xl border border-slate-100 opacity-0 ${isFormRevealed ? 'animate-fade-in-up delay-300' : ''} text-left`}>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-8">Send a Message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">First Name</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Last Name</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <input type="email" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-colors" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Your Message</label>
                <textarea rows="4" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-colors resize-none" placeholder="How can we help you craft your perfect getaway?"></textarea>
              </div>
              <Button variant="primary" size="lg" className="w-full !rounded-2xl py-4 text-lg">Send Message</Button>
            </form>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
