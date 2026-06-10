import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMessagesByBooking, useSendMessage } from '@/features/messages/hooks/useMessages';
import { getSocket } from '@/shared/lib/socket';
import { FiSend } from 'react-icons/fi';

const ChatThread = ({ booking }) => {
  const { data: historyData, isLoading } = useMessagesByBooking(booking.id || booking._id);
  const [localMessages, setLocalMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  
  const chatContainerRef = useRef(null);
  const prevBookingIdRef = useRef(null);
  const sendMutation = useSendMessage();

  const history = historyData?.history || historyData?.data || (Array.isArray(historyData) ? historyData : []);
  
  // Filter out any local messages that are already present in history
  const uniqueLocalMessages = localMessages.filter((localMsg) => {
    return !history.some((historyMsg) => {
      const isSameId = localMsg.id && historyMsg.id && localMsg.id === historyMsg.id;
      const isSameContent = localMsg.content === historyMsg.content && 
                            (localMsg.sender_id?._id || localMsg.sender_id) === (historyMsg.sender_id?._id || historyMsg.sender_id);
      return isSameId || isSameContent;
    });
  });

  const allMessages = [...history, ...uniqueLocalMessages];

  useEffect(() => {
    // Clear local messages when switching chat threads
    setLocalMessages([]);
  }, [booking.id, booking._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_booking', booking.id || booking._id);

    const handleNewMessage = (msg) => {
      if (msg.booking_id === booking.id || msg.booking_id === booking._id) {
        // Only push to local messages if sender is not the current user
        // (the current user gets the message immediately through optimistic UI)
        const isOwn = (msg.sender_id?._id || msg.sender_id) === (user?.id || user?._id);
        if (!isOwn) {
          setLocalMessages((prev) => [...prev, msg]);
        }
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_booking', booking.id || booking._id);
    };
  }, [booking.id, booking._id, user?.id, user?._id]);

  // Premium container scroll positioning without jumping the parent viewport
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const currentBookingId = booking.id || booking._id;
    const isNewThread = prevBookingIdRef.current !== currentBookingId;

    if (isNewThread) {
      // Instant scroll to bottom when opening a new thread
      container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
      prevBookingIdRef.current = currentBookingId;
    } else {
      // Smooth scroll for new messages added to active thread
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [allMessages, booking]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const bookingId = booking.id || booking._id;

    // Send via API (persists it to database and triggers real-time socket emit on server)
    sendMutation.mutate({ bookingId, content: newMessage });
    
    // Optimistic UI updates chat bubble instantly
    const optimisticMsg = {
      content: newMessage,
      sender_id: user?.id || user?._id,
      created_at: new Date().toISOString(),
      booking_id: bookingId,
      optimistic: true
    };
    
    setLocalMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
  };

  // Format message time
  const formatMsgTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Group messages by date separators
  const getMessageGroups = () => {
    const groups = [];
    let currentGroup = null;

    allMessages.forEach((msg) => {
      const msgDate = new Date(msg.created_at || msg.createdAt);
      
      let label = '';
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (msgDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = msgDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      }

      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, messages: [] };
        groups.push(currentGroup);
      }

      currentGroup.messages.push(msg);
    });

    return groups;
  };

  const messageGroups = getMessageGroups();

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* Scrollable messages area */}
      <div 
        ref={chatContainerRef}
        className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium py-20">
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-2xl p-4 mb-2">
              <FiSend className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-sm">No messages yet. Say hello to start the chat!</p>
          </div>
        ) : (
          messageGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              
              {/* Sticky Date Separator Badges */}
              <div className="flex justify-center my-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white shadow-sm border border-slate-100/80 px-3.5 py-1.5 rounded-full">
                  {group.label}
                </span>
              </div>

              {/* Message bubbles list */}
              {group.messages.map((msg, index) => {
                const isOwn = (msg.sender_id?._id || msg.sender_id) === (user?.id || user?._id);
                return (
                  <div key={msg.id || msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className="max-w-[70%] space-y-0.5">
                      <div className={`px-5 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                        isOwn 
                          ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                      } ${msg.optimistic ? 'opacity-70 scale-[0.98]' : ''}`}>
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      </div>
                      <span className={`text-[9px] text-slate-400 mt-1 block px-1 tracking-tight ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatMsgTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          ))
        )}
      </div>

      {/* Input Entry Box Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100/80 bg-white flex gap-3.5 items-center rounded-br-3xl">
        <input 
          type="text" 
          placeholder="Type your message here..." 
          className="flex-grow px-5 py-3.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 text-sm transition-all placeholder:text-slate-400 text-slate-800 focus:bg-white"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim() || sendMutation.isPending}
          className="bg-slate-900 text-white p-3.5 rounded-2xl font-bold shadow-lg hover:bg-indigo-600 transition-all focus:ring-4 focus:ring-indigo-100 disabled:opacity-30 disabled:hover:bg-slate-900 flex items-center justify-center flex-shrink-0"
        >
          <FiSend className="w-4.5 h-4.5" />
        </button>
      </form>

    </div>
  );
};

export default ChatThread;
