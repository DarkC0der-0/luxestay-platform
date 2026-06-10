import React, { useState } from 'react';
import Button from '@/shared/components/Button';
import useScrollReveal from '@/shared/hooks/useScrollReveal';

const NewsletterCTA = () => {
  const [ref, isRevealed] = useScrollReveal();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      // Auto-reset success message after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <section ref={ref} className={`px-6 py-12 md:py-24 bg-white opacity-0 ${isRevealed ? 'animate-fade-in-up' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-indigo-600 rounded-[30px] md:rounded-[40px] p-6 sm:p-10 md:p-20 relative overflow-hidden text-center md:text-left">
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
 
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-white">
              <span className="font-black uppercase tracking-[0.2em] text-[10px] mb-4 block text-indigo-200">Stay Updated</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                Unlock Exclusive Offers
              </h2>
              <p className="text-indigo-100 font-medium text-lg max-w-md mx-auto md:mx-0">
                Subscribe to our newsletter and be the first to know about new luxury properties and hidden gem destinations.
              </p>
            </div>
 
            <div className="w-full md:w-auto flex-1 max-w-md text-left">
              {isSubscribed ? (
                <div className="bg-white/15 p-6 rounded-[24px] backdrop-blur-md border border-white/20 text-white animate-modal-in">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30 shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-black text-xl leading-tight">Thank you for subscribing!</p>
                      <p className="text-sm text-indigo-200 font-semibold mt-1">You've successfully joined our exclusive list.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form 
                  onSubmit={handleSubscribe} 
                  className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl sm:rounded-3xl backdrop-blur-md border border-white/20"
                >
                  <input 
                     type="email" 
                     placeholder="Enter your email address" 
                     className="w-full bg-transparent border-none text-white placeholder:text-indigo-200 px-6 py-4 focus:ring-0 focus:outline-none rounded-2xl"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="!rounded-2xl shrink-0 !bg-white !text-indigo-600 hover:!bg-indigo-50 hover:!text-indigo-700 border-none"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
              <p className="text-indigo-200 text-sm mt-4 font-medium text-center md:text-left pl-4">
                No spam, just luxury. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
