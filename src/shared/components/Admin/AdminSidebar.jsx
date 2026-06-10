import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiPieChart, 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiDollarSign, 
  FiArrowLeft,
  FiLogOut,
  FiCalendar,
  FiSettings
} from 'react-icons/fi';
import { useAuthStore } from '@/features/auth/store/authStore';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const { logout } = useAuthStore();

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiPieChart className="text-xl" /> },
    { name: 'Properties', path: '/admin/properties', icon: <FiHome className="text-xl" /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FiCalendar className="text-xl" /> },
    { name: 'Finance', path: '/admin/finance', icon: <FiDollarSign className="text-xl" /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers className="text-xl" /> },
    { name: 'Support', path: '/admin/support', icon: <FiMessageSquare className="text-xl" /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings className="text-xl" /> },
  ];

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-950 border-r border-slate-900 duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-6 border-b border-slate-900/60">
        <div 
          className="text-2xl md:text-3xl font-black tracking-tighter cursor-pointer flex items-center group transition-transform hover:scale-105 duration-300 gap-1.5" 
          onClick={() => navigate('/admin/dashboard')}
        >
          <span className="text-indigo-500">LUXE</span>
          <span className="text-white">STAY</span>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase self-end mb-0.5 ml-1.5">Admin</span>
        </div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="text-2xl" />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto h-full justify-between mt-6">
        <nav className="px-4 flex-1">
          <h3 className="mb-4 ml-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Main Management
          </h3>

          <ul className="mb-6 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.98] ${
                      isActive 
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 glow-indigo' 
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    {/* Visual left active line indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-indigo-500 animate-pulse"></span>
                    )}
                    <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer actions */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/40">
          <ul className="flex flex-col gap-1.5">
            <li>
              <button
                onClick={() => navigate('/')}
                className="group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
              >
                <FiHome className="text-xl text-slate-400 group-hover:text-slate-200 transition-transform duration-300 group-hover:scale-105" />
                Go to Website
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:bg-red-500/5 text-slate-400 hover:text-red-400"
              >
                <FiLogOut className="text-xl text-slate-400 group-hover:text-red-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
