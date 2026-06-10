import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUiStore } from '@/shared/store/uiStore';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import { FiHome, FiMessageSquare, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { BiTrip } from 'react-icons/bi';
import Button from '../Button';

/**
 * Adaptive Navbar
 * Transitions between Transparent (at top of Home) and Glassmorphic (on scroll or other pages).
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isTransparentPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact' || location.pathname.startsWith('/properties');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'host':
        return '/hosting';
      default:
        return '/trips';
    }
  };

  // Logic for dynamic classes
  const isTransparent = isTransparentPage && !scrolled && !isMobileMenuOpen;
  
  const navClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out px-6 flex items-center justify-between ${
    isTransparent 
      ? 'bg-transparent py-7 border-transparent' 
      : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-4'
  }`;

  const textClasses = isTransparent ? 'text-white' : 'text-slate-800';
  const subTextClasses = isTransparent ? 'text-slate-300' : 'text-slate-500';

  return (
    <>
      <nav className={navClasses}>
      {/* Brand */}
      <div 
        className="text-2xl md:text-3xl font-black tracking-tighter cursor-pointer flex items-center group transition-transform hover:scale-105 duration-300" 
        onClick={() => navigate('/')}
      >
        <span className="text-indigo-500">LUXE</span>
        <span className={`${textClasses} transition-colors duration-500`}>STAY</span>
      </div>

      {/* Desktop Menu */}
      <ul className={`hidden md:flex items-center space-x-1 lg:space-x-4 px-4 py-2 rounded-full border transition-all duration-500 ${
        isTransparent 
          ? 'bg-white/10 backdrop-blur-md border-white/20 shadow-none' 
          : 'bg-white/50 backdrop-blur-md border-slate-200/50 shadow-sm'
      }`}>
        <NavLink to="/" isTransparent={isTransparent}>Home</NavLink>
        <NavLink to="/properties" isTransparent={isTransparent}>Properties</NavLink>
        <NavLink to="/about" isTransparent={isTransparent}>About</NavLink>
        <NavLink to="/contact" isTransparent={isTransparent}>Contact</NavLink>
        </ul>

      {/* Auth / Profile Area */}
      <div className="hidden md:flex items-center space-x-4">
        {!isAuthenticated ? (
          <>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className={`font-bold transition-colors duration-500 ${isTransparent ? 'text-white hover:text-indigo-300 hover:bg-white/10' : 'text-slate-700'}`}
            >
              Log in
            </Button>
            <Button 
              variant={isTransparent ? 'glass' : 'secondary'}
              size="sm"
              onClick={() => navigate('/signup')}
              className="!rounded-full px-6"
            >
              Sign up
            </Button>
          </>
        ) : (
          <div className={`flex items-center border rounded-full p-1 pl-4 shadow-sm hover:shadow-md transition-all duration-500 ${
            isTransparent ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'
          }`}>
             <div className="flex flex-col items-end mr-3">
               <span className={`text-xs font-bold leading-none transition-colors duration-500 ${isTransparent ? 'text-white' : 'text-slate-800'}`}>{user?.name || user?.firstName}</span>
               <span className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 transition-colors duration-500 ${isTransparent ? 'text-indigo-300' : 'text-slate-400'}`}>{user?.role}</span>
             </div>
             
             <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer border-2 border-white/20">
                  {user?.name?.[0] || user?.firstName?.[0] || 'U'}
                </div>
                
                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 p-2">
                   <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                     <FiUser className="mr-2" /> My Profile
                   </Link>
                   {user?.role === 'guest' && (
                     <Link to="/trips" className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                       <BiTrip className="mr-2 text-base" /> My Trips
                     </Link>
                   )}
                   {user?.role === 'host' && (
                     <Link to="/hosting" className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                       <FiHome className="mr-2" /> Host Dashboard
                     </Link>
                   )}
                   {user?.role === 'admin' && (
                     <Link to="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                       <FiSettings className="mr-2" /> Admin Dashboard
                     </Link>
                   )}
                   {isAuthenticated && user?.role !== 'admin' && (
                     <Link to="/messages" className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                       <FiMessageSquare className="mr-2 text-base" /> Messages
                     </Link>
                   )}
                   <div className="h-px bg-slate-100 my-1 mx-2" />
                   <button 
                     onClick={handleLogout}
                     className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                   >
                     <FiLogOut className="mr-2" /> Log out
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        className={`md:hidden text-2xl p-2 -mr-2 transition-all active:scale-90 ${isTransparent ? 'text-white' : 'text-slate-800'}`} 
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <RxCross2 /> : <RxHamburgerMenu />}
      </button>

      </nav>
 
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden pt-24 px-6 flex flex-col`}>
         <div className="flex-1 overflow-y-auto pb-8">
          <div className="space-y-2 mb-8">
            <MobileNavLink to="/">Home</MobileNavLink>
            <MobileNavLink to="/properties">Properties</MobileNavLink>
            <MobileNavLink to="/about">About</MobileNavLink>
            <MobileNavLink to="/contact">Contact</MobileNavLink>
          </div>
          
          <div className="h-px bg-slate-100 mb-8" />
          
          {!isAuthenticated ? (
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => { navigate('/login'); closeMobileMenu(); }}
                variant="ghost"
                size="lg"
                className="w-full !bg-slate-50"
              >
                Log in
              </Button>
              <Button 
                onClick={() => { navigate('/signup'); closeMobileMenu(); }}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Sign up
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account</h3>
              <MobileNavLink to="/profile" icon={<FiUser />}>My Profile</MobileNavLink>
              <MobileNavLink to={getDashboardPath(user?.role)} icon={<FiUser />}>Dashboard</MobileNavLink>
              {user?.role !== 'admin' && (
                <MobileNavLink to="/messages" icon={<FiMessageSquare />}>Messages</MobileNavLink>
              )}
              
              {user?.role === 'guest' && <MobileNavLink to="/trips" icon={<BiTrip />}>My Trips</MobileNavLink>}
              
              {user?.role === 'host' && (
                <MobileNavLink to="/hosting" icon={<FiHome />} highlight>Host Dashboard</MobileNavLink>
              )}
              
              {user?.role === 'admin' && (
                <MobileNavLink to="/admin/dashboard" icon={<FiSettings />} highlightColor="purple">Admin Dashboard</MobileNavLink>
              )}
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <button 
                  onClick={() => { handleLogout(); closeMobileMenu(); }} 
                  className="flex items-center w-full p-4 text-lg font-bold text-red-500 bg-red-50 rounded-2xl active:bg-red-100 transition-colors"
                >
                  <FiLogOut className="mr-3" /> Log out
                </button>
              </div>
            </div>
          )}
         </div>
      </div>
    </>
  );
};

const NavLink = ({ to, children, icon, highlight, highlightColor = 'indigo', isTransparent }) => {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  const baseClasses = "flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500";
  
  const activeClasses = highlight 
    ? `bg-${highlightColor}-500 text-white shadow-lg shadow-${highlightColor}-500/20` 
    : isTransparent ? "text-white font-black" : "text-indigo-600 font-black";
    
  const inactiveClasses = isTransparent 
    ? "text-white/70 hover:text-white hover:bg-white/10" 
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50";

  return (
    <li>
      <Link to={to} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        {children}
      </Link>
    </li>
  );
};

const MobileNavLink = ({ to, children, icon, highlight, highlightColor = 'indigo' }) => {
  const location = useLocation();
  const { closeMobileMenu } = useUiStore();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  const baseClasses = "flex items-center p-4 rounded-2xl text-xl font-bold transition-colors";
  
  const activeClasses = highlight
    ? `bg-${highlightColor}-50 text-${highlightColor}-700`
    : "bg-slate-50 text-slate-900";
    
  const inactiveClasses = "text-slate-600 active:bg-slate-50";

  return (
    <Link to={to} onClick={closeMobileMenu} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon && <span className="mr-4 text-2xl">{icon}</span>}
      {children}
    </Link>
  );
};

export default Navbar;
