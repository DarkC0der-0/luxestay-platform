import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useGuestBookings, useHostReservations } from '@/features/bookings/hooks/useBookings';
import { useConversations } from '@/features/messages/hooks/useMessages';
import { initializeSocket, disconnectSocket, getSocket } from '@/shared/lib/socket';
import ChatThread from '@/features/messages/components/ChatThread';
import { FiSearch, FiMessageSquare, FiCalendar, FiUser, FiMapPin, FiInbox, FiClock, FiChevronRight } from 'react-icons/fi';

const ChatPage = () => {
  const { user } = useAuthStore();
  const [activeBooking, setActiveBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const paramBookingId = searchParams.get('bookingId');
  const queryClient = useQueryClient();

  const isHost = user?.role === 'host';
  const guestQuery = useGuestBookings();
  const hostQuery = useHostReservations();
  const { data: bookingsResponse, isLoading: bookingsLoading } = isHost ? hostQuery : guestQuery;
  const bookingsList = bookingsResponse?.bookings || bookingsResponse?.data || (Array.isArray(bookingsResponse) ? bookingsResponse : []);

  const { data: conversationsResponse, isLoading: conversationsLoading } = useConversations();
  const activeConversations = conversationsResponse?.conversations || conversationsResponse?.data || (Array.isArray(conversationsResponse) ? conversationsResponse : []);

  const isLoading = conversationsLoading || bookingsLoading;

  const queryPropertyId = searchParams.get('propertyId');
  const queryHostId = searchParams.get('hostId');
  const queryHostName = searchParams.get('hostName');
  const queryPropertyTitle = searchParams.get('propertyTitle');

  const hasQueryParams = queryPropertyId && queryHostId;
  const mockId = hasQueryParams ? `direct-${queryPropertyId}__${queryHostId}` : null;
  
  // Robust check for existing conversation matching the query parameters
  const conversationExists = hasQueryParams ? activeConversations.some(c => 
    String(c.property_id || c.property?.id) === String(queryPropertyId) && 
    String(c.other_user_id || c.user?.id) === String(queryHostId)
  ) : false;

  const directMockBooking = hasQueryParams && !conversationExists ? {
    id: mockId,
    property_id: queryPropertyId,
    other_user_id: queryHostId,
    lastMessageContent: '',
    lastMessageTime: null,
    messageCount: 0,
    property: {
      id: queryPropertyId,
      title: decodeURIComponent(queryPropertyTitle || 'Property Inquiry'),
      location: 'Location pending',
      image: '/placeholder.png',
      host_id: {
        id: queryHostId,
        name: decodeURIComponent(queryHostName || 'Host'),
        avatar_url: null
      }
    },
    user: {
      id: queryHostId,
      name: decodeURIComponent(queryHostName || 'Host'),
      role: 'host',
      avatar_url: null
    },
    isPreBooking: true
  } : null;

  const allConversations = [...activeConversations];
  if (directMockBooking) {
    allConversations.unshift(directMockBooking);
  }

  const hasMatchingActiveConversation = (booking) => {
    const bPropId = booking.property_id || booking.property?.id;
    const bOtherUserId = isHost 
      ? (booking.guest_id || booking.user?.id || booking.user?._id) 
      : (booking.property?.host_id?.id || booking.property?.host_id || booking.host_id);
    
    return activeConversations.some(c => {
      const cPropId = c.property_id || c.property?.id;
      const cOtherUserId = c.other_user_id || c.user?.id || c.user?._id;
      return String(cPropId) === String(bPropId) && String(cOtherUserId) === String(bOtherUserId);
    });
  };

  useEffect(() => {
    initializeSocket();
    const socket = getSocket();
    if (socket) {
      const handleGlobalMessage = (msg) => {
        const currentUserId = user?.id || user?._id;
        const isParticipant = msg.sender_id === currentUserId || msg.receiver_id === currentUserId;
        if (!isParticipant) return;

        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['host-reservations'] });

        const activeBookingId = activeBooking?.id || activeBooking?._id;
        if (activeBookingId && msg.booking_id === activeBookingId) {
          queryClient.invalidateQueries({ queryKey: ['messages', activeBookingId] });
        }
      };

      socket.on('receive_message', handleGlobalMessage);
      socket.on('online_users', (users) => {
        setOnlineUserIds(users);
      });

      return () => {
        socket.off('receive_message', handleGlobalMessage);
        socket.off('online_users');
        disconnectSocket();
      };
    }

    return () => {
      disconnectSocket();
    };
  }, [activeBooking, user?.id, user?._id, queryClient]);

  // Handle URL parameter query selector and default auto-select
  useEffect(() => {
    // 1. Prioritize direct property inquiries (from PropertyDetailsPage)
    if (hasQueryParams) {
      const match = allConversations.find(c => 
        String(c.property_id || c.property?.id) === String(queryPropertyId) && 
        String(c.other_user_id || c.user?.id) === String(queryHostId)
      );
      if (match) {
        if (!activeBooking || (activeBooking.id !== match.id && activeBooking._id !== match.id)) {
          setActiveBooking(match);
        }
        return;
      }
    }

    // 2. Handle specific bookingId if provided
    const queryBookingId = searchParams.get('bookingId');
    if (queryBookingId) {
      const activeId = activeBooking?.id || activeBooking?._id;
      if (activeId !== queryBookingId) {
        const match = allConversations.find(c => (c.id || c._id) === queryBookingId);
        if (match) {
          setActiveBooking(match);
          return;
        }
        const inactiveMatch = bookingsList.find(b => (b.id || b._id) === queryBookingId);
        if (inactiveMatch) {
          setActiveBooking(inactiveMatch);
          return;
        }
      }
      if (activeBooking) return; // Already selected the right one or tried
    }

    // 3. Fallback default selections:
    if (!activeBooking && !isLoading) {
      if (allConversations.length > 0) {
        setActiveBooking(allConversations[0]);
      } else if (bookingsList.length > 0) {
        setActiveBooking(bookingsList[0]);
      }
    }
  }, [searchParams, allConversations, bookingsList, hasQueryParams, queryPropertyId, queryHostId, activeBooking, isLoading]);

  // Clean date formatting helper
  const formatChatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  // Check-in dates parsing with safety fallback
  const getBookingDates = (booking) => {
    const rawCheckIn = booking.startDate || booking.start_date || booking.check_in;
    const rawCheckOut = booking.endDate || booking.end_date || booking.check_out;
    
    if (!rawCheckIn) return 'Dates pending';
    
    const start = new Date(rawCheckIn);
    const end = rawCheckOut ? new Date(rawCheckOut) : null;
    
    if (isNaN(start.getTime())) return 'Dates pending';
    
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (!end || isNaN(end.getTime())) return startStr;
    
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Search filters
  const filteredActiveConversations = allConversations.filter((conv) => {
    const title = (conv.property?.title || '').toLowerCase();
    const otherParty = (isHost ? (conv.user?.name || '') : (conv.property?.host_id?.name || '')).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || otherParty.includes(query);
  });

  const filteredInactiveBookings = bookingsList.filter((booking) => {
    if (hasMatchingActiveConversation(booking)) return false;

    const title = (booking.property?.title || '').toLowerCase();
    const otherParty = (isHost ? (booking.user?.name || 'Guest') : (booking.property?.host_id?.name || 'Host')).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || otherParty.includes(query);
  });

  const handleSelectBooking = (booking) => {
    setActiveBooking(booking);
    // Sync query parameter
    setSearchParams({ bookingId: booking.id || booking._id });
  };

  return (
    <div className="pt-28 pb-12 px-4 md:px-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 h-[80vh] overflow-hidden transition-all duration-300">
        
        {/* Sidebar: Conversations */}
        <div className="w-full md:w-[380px] border-r border-slate-100 bg-white/50 flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100/80 bg-white/30 backdrop-blur-sm">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Messages</h2>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiSearch className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-xs font-semibold text-slate-400">Loading inbox...</p>
              </div>
            ) : allConversations.length === 0 && bookingsList.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-slate-100/80 text-slate-400 rounded-2xl p-4 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <FiInbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">Your inbox is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">When you book properties or host users, your chats will appear here.</p>
                {!isHost && (
                  <Link to="/properties" className="mt-4 inline-block text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors">Explore Listings</Link>
                )}
              </div>
            ) : (
              <>
                {/* Active Conversations Section */}
                {filteredActiveConversations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Active Conversations</h3>
                    <div className="space-y-1.5">
                      {filteredActiveConversations.map((booking) => {
                        const bId = booking.id || booking._id;
                        const isActive = activeBooking && (activeBooking.id === bId || activeBooking._id === bId);
                        const title = booking.property?.title || 'Luxury Villa';
                        const otherParty = isHost ? (booking.user) : (booking.property?.host_id);
                        const otherPartyName = otherParty?.name || (isHost ? 'Guest' : 'Host');
                        const otherPartyId = otherParty?.id || otherParty?._id;
                        const isOnline = onlineUserIds.includes(String(otherPartyId));
                        const initials = otherPartyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        
                        return (
                          <div 
                            key={bId}
                            onClick={() => handleSelectBooking(booking)}
                            className={`group p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border flex gap-3.5 items-start ${
                              isActive 
                                ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 text-white' 
                                : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-900'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm tracking-wider ${
                                isActive 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md'
                              }`}>
                                {initials}
                              </div>
                              {isOnline && (
                                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-emerald-500 ${isActive ? 'ring-indigo-600' : ''}`}></span>
                              )}
                            </div>

                            {/* Text Info */}
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <h4 className="font-bold text-sm truncate pr-2">{otherPartyName}</h4>
                                <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {formatChatTime(booking.lastMessageTime || booking.created_at)}
                                </span>
                              </div>
                              <p className={`text-xs font-medium truncate ${isActive ? 'text-indigo-150' : 'text-indigo-600'}`}>
                                {title}
                              </p>
                              {booking.lastMessageContent && (
                                <p className={`text-xs mt-1 truncate ${isActive ? 'text-white/85' : 'text-slate-500'}`}>
                                  {booking.lastMessageContent}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inactive Bookings / New Conversations Section */}
                {filteredInactiveBookings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Start a Conversation</h3>
                    <div className="space-y-1.5">
                      {filteredInactiveBookings.map((booking) => {
                        const bId = booking.id || booking._id;
                        const title = booking.property?.title || 'Luxury Villa';
                        const otherPartyName = isHost ? (booking.user?.name || 'Guest') : (booking.property?.host_id?.name || 'Host');
                        const initials = otherPartyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        
                        return (
                          <div 
                            key={bId}
                            onClick={() => handleSelectBooking(booking)}
                            className="group p-3 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-all duration-200 flex gap-3 items-center text-slate-800"
                          >
                            <div className="w-9 h-9 rounded-full bg-slate-200/80 group-hover:bg-indigo-100/80 flex items-center justify-center font-bold text-xs text-slate-600 group-hover:text-indigo-700 flex-shrink-0 transition-colors">
                                {initials}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-xs truncate group-hover:text-indigo-900 transition-colors">{otherPartyName}</h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{title}</p>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                              <FiChevronRight className="w-4 h-4 text-indigo-500" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main: Chat Thread */}
        <div className="flex-grow flex flex-col h-full bg-slate-50/50">
          {activeBooking ? (
            <>
              {/* Thread Header */}
              <div className="p-6 border-b border-slate-100/80 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md">
                      {(isHost ? (activeBooking.user?.name || 'Guest') : (activeBooking.property?.host_id?.name || 'Host'))
                        .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    {onlineUserIds.includes(String(isHost ? (activeBooking.user?.id || activeBooking.user?._id) : (activeBooking.property?.host_id?.id || activeBooking.property?.host_id))) && (
                      <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-emerald-500"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">
                      {isHost ? (activeBooking.user?.name || 'Guest') : (activeBooking.property?.host_id?.name || 'Host')}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="text-indigo-600 font-bold hover:underline">{activeBooking.property?.title}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {getBookingDates(activeBooking)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {onlineUserIds.includes(String(isHost ? (activeBooking.user?.id || activeBooking.user?._id) : (activeBooking.property?.host_id?.id || activeBooking.property?.host_id))) ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-black tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-black tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    Offline
                  </div>
                )}
              </div>
              
              {/* Thread Container */}
              <div className="flex-grow overflow-hidden relative">
                <ChatThread booking={activeBooking} />
              </div>
            </>
          ) : (
            /* Selected State Fallback */
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/20">
              <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-500 rounded-3xl p-6 mb-4 animate-bounce">
                <FiMessageSquare className="w-12 h-12" />
              </div>
              <h3 className="font-black text-xl text-slate-800 tracking-tight">Select a conversation</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                Choose a guest or host reservation from the sidebar to view messages or start planning check-in times.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
