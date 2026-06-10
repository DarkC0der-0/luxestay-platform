import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiArrowUp } from 'react-icons/fi';
import Button from '../Button';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-24 pb-12 px-6 overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">
        {/* Brand Section */}
        <div className="md:col-span-4">
          <div 
            className="text-3xl font-black tracking-tighter text-white mb-6 cursor-pointer inline-block group"
            onClick={scrollToTop}
          >
            LUXE<span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">STAY</span>
          </div>
          <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-sm">
            Curating the world's most extraordinary stays. From remote coastal escapes to high-design urban sanctuaries, we define the next generation of premium travel.
          </p>
          <div className="flex space-x-5">
            <SocialIcon icon={<FiInstagram />} href="#" />
            <SocialIcon icon={<FiTwitter />} href="#" />
            <SocialIcon icon={<FiFacebook />} href="#" />
            <SocialIcon icon={<FiLinkedin />} href="#" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 md:ml-auto">
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Explore</h4>
          <ul className="space-y-4 text-sm font-semibold">
            <FooterLink to="/properties">All Listings</FooterLink>
            <FooterLink to="/villas">Luxury Villas</FooterLink>
            <FooterLink to="/about">Our Story</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="md:col-span-2">
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
          <ul className="space-y-4 text-sm font-semibold">
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/cookies">Cookie Policy</FooterLink>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="md:col-span-4">
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Stay Inspired</h4>
          <p className="text-sm text-slate-400 mb-6 font-medium">Join our private list for early access to new properties and exclusive travel insights.</p>
          <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Email address" 
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Button variant="primary" className="!rounded-xl shadow-none">
              Join
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row-reverse justify-between items-center gap-6 relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} LUXESTAY GLOBAL. ALL RIGHTS RESERVED.
        </p>
        
        <button 
          onClick={scrollToTop}
          className="group flex items-center space-x-3 text-xs font-black text-indigo-400 hover:text-white transition-all uppercase tracking-tighter"
        >
          <span>Back to Top</span>
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
            <FiArrowUp className="text-sm group-hover:-translate-y-1 transition-transform" />
          </div>
        </button>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="hover:text-white transition-colors flex items-center group">
      <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
      {children}
    </Link>
  </li>
);

export default Footer;
