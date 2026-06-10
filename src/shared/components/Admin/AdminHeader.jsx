import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FiMenu, FiSearch, FiBell, FiCalendar, FiMessageSquare, FiClock, FiUser, FiHome, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/shared/lib/axios';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Global Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ properties: [], users: [], bookings: [] });
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Profile dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const { data } = await apiClient.get('/admin/profile');
      if (data.success) {
        setAuth(data.data, token);
      }
    } catch (error) {
      console.error('Failed to fetch admin profile', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/admin/notifications');
      if (data.success) {
        setNotifications(data.data);
        const readIds = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
        const unreads = data.data.filter(n => !readIds.includes(n.id));
        setUnreadCount(unreads.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    
    // Close dropdowns on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Search Debounce fetch
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults({ properties: [], users: [], bookings: [] });
      setSearchDropdownOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/admin/search?q=${searchQuery}`);
        if (data.success) {
          setSearchResults(data.data);
          setSearchDropdownOpen(true);
        }
      } catch (error) {
        console.error('Failed to query global search', error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && notifications.length > 0) {
      // Mark all current notifications as read
      const readIds = notifications.map(n => n.id);
      localStorage.setItem('admin_read_notifications', JSON.stringify(readIds));
      setUnreadCount(0);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
        
        {/* Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-xl border border-slate-100 bg-white p-2 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FiMenu className="text-xl text-slate-600" />
          </button>
        </div>

        {/* Search Input Area */}
        <div className="hidden sm:block relative" ref={searchRef}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FiSearch className="text-lg" />
              </span>
              <input
                type="text"
                placeholder="Search properties, users, or bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200/80 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100/40 transition-all duration-300 xl:w-96 font-medium"
              />
            </div>
          </form>

          {/* Search Dropdown Panel */}
          {searchDropdownOpen && (
            <div className="absolute left-0 mt-3 w-80 sm:w-115 bg-white rounded-2xl border border-slate-200 shadow-xl py-3.5 z-50 animate-modal-in max-h-96 overflow-y-auto no-scrollbar">
              
              {/* Properties Section */}
              {searchResults?.properties && searchResults.properties.length > 0 && (
                <div className="px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Properties</span>
                  <div className="space-y-1">
                    {searchResults.properties.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          navigate(`/admin/properties?q=${p.title}`);
                          setSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FiHome className="text-slate-400 text-sm" />
                          <span className="text-xs font-bold text-slate-800">{p.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{p.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Section */}
              {searchResults?.users && searchResults.users.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-50 mt-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Users</span>
                  <div className="space-y-1">
                    {searchResults.users.map(u => (
                      <div 
                        key={u.id} 
                        onClick={() => {
                          navigate(`/admin/users?q=${u.name}`);
                          setSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FiUser className="text-slate-400 text-sm" />
                          <span className="text-xs font-bold text-slate-800">{u.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold capitalize bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Section */}
              {searchResults?.bookings && searchResults.bookings.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-50 mt-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Bookings</span>
                  <div className="space-y-1">
                    {searchResults.bookings.map(b => (
                      <div 
                        key={b.id} 
                        onClick={() => {
                          navigate(`/admin/bookings?q=${b.guest_name}`);
                          setSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex flex-col transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-slate-400 text-sm" />
                          <span className="text-xs font-bold text-slate-800">Booking by {b.guest_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5 ml-5">{b.property_title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!searchResults?.properties?.length && !searchResults?.users?.length && !searchResults?.bookings?.length) && (
                <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Notification Area */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/20 hover:border-indigo-100 active:scale-95 transition-all duration-200"
            >
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              )}
              <FiBell className="text-lg" />
            </button>

            {/* Notifications Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl py-3 z-50 animate-modal-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto no-scrollbar divide-y divide-slate-50">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-slate-50/50 transition-colors flex gap-3 cursor-pointer">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {notif.type === 'booking' ? <FiCalendar className="text-base" /> : <FiMessageSquare className="text-base" />}
                      </div>
                      
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="block font-bold text-slate-900 text-xs">{notif.title}</span>
                        <p className="text-slate-500 text-xs leading-normal break-words font-medium">{notif.message}</p>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold pt-1">
                          <FiClock /> {formatTime(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No notifications found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Area */}
          <div className="relative flex items-center gap-3.5 pl-4 border-l border-slate-100" ref={profileDropdownRef}>
            <div className="hidden text-right lg:block cursor-pointer" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <span className="block text-sm font-bold text-slate-800">
                {user?.name || 'System Admin'}
              </span>
              <span className="block text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                {user?.role || 'Administrator'}
              </span>
            </div>

            <div 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="relative cursor-pointer active:scale-95 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md border-2 border-white/20">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0] || 'A'
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-3.5 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl py-3 z-50 animate-modal-in">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <span className="block font-bold text-slate-900 text-sm">{user?.name || 'System Admin'}</span>
                  <span className="block text-[11px] text-slate-400 font-medium truncate">{user?.email || 'admin@luxestay.com'}</span>
                </div>
                
                <div className="p-1.5 space-y-1">
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                  >
                    <FiHome className="text-sm" />
                    Go to Homepage
                  </button>
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors flex items-center gap-2"
                  >
                    <FiLogOut className="text-sm" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
