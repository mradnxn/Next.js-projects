"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getApiUrl } from "@/utils/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'requests'
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/notifications`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll every 20 seconds to prevent app slowdown and server overload
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleBookingAction = async (e, notif, newStatus) => {
    e.stopPropagation(); // Prevent dropdown from closing or navigating
    
    // First mark the notification as read if it isn't
    if (!notif.isRead) {
        await handleMarkAsRead(notif._id);
    }

    if (!notif.relatedBooking) return;

    // Safely get the ID if populated
    const bookingId = notif.relatedBooking._id || notif.relatedBooking;

    setActionLoading(notif._id);
    try {
       const res = await fetch(`${getApiUrl()}/api/bookings/${bookingId}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({ status: newStatus })
       });
       
       if (res.ok) {
           // Refetch notifications to sync state across the app
           await fetchNotifications();
           
           // Close the dropdown and modal
           setIsOpen(false);
           
           // Navigate to the trip dashboard as requested by the user
           if (notif.relatedTrip) {
               const tripId = notif.relatedTrip._id || notif.relatedTrip;
               router.push(`/trip/${tripId}`);
           }
       } else {
           const data = await res.json();
           alert(data.msg || "Failed to update booking");
       }
    } catch (err) {
       console.error("Booking action error:", err);
       alert("An error occurred processing that request.");
    } finally {
       setActionLoading(null);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }

    setIsOpen(false);

    if (notif.type === "booking_request" || notif.type === "chat_message") {
       if (notif.relatedTrip) {
           const tripId = notif.relatedTrip._id || notif.relatedTrip;
           router.push(`/trip/${tripId}`);
       }
       return;
    }

    // Navigation logic based on type
    if (notif.type === "booking_accepted" || notif.type === "booking_rejected") {
       router.push("/my-bookings");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const pathname = usePathname();

  // Do not render on landing page and auth pages
  const hiddenPaths = ["/", "/login", "/signup"];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }
  
  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Target area for clicks */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-900 shadow-2xl border border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 group transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-200 group-hover:text-white transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-orange-500 rounded-full ring-4 ring-slate-900 border border-orange-400">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
             <h3 className="font-bold text-white tracking-tight">Notifications</h3>
             {unreadCount > 0 && (
                <button 
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider"
                >
                    Mark all read
                </button>
             )}
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-900 px-2 pt-2 gap-2">
             <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                    activeTab === 'all' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/30'
                }`}
             >
                 All
             </button>
             <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
                    activeTab === 'requests' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/30'
                }`}
             >
                 Requests
                 {notifications.filter(n => n.type === 'booking_request' && !n.isRead).length > 0 && (
                     <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                 )}
             </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar bg-slate-900/40">
             {notifications.filter(n => activeTab === 'all' || n.type === 'booking_request').length === 0 ? (
                 <div className="p-8 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-3 opacity-20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <p className="text-sm">No {activeTab === 'requests' ? 'requests' : 'notifications'} yet</p>
                 </div>
             ) : (
                 <ul className="divide-y divide-slate-800/50">
                    {notifications.filter(n => activeTab === 'all' || n.type === 'booking_request').map((notif) => {
                        const isPendingRequest = notif.type === 'booking_request' && notif.relatedBooking?.status === 'pending';
                        const isVisuallyUnread = !notif.isRead || isPendingRequest;

                        return (
                        <li 
                           key={notif._id} 
                           className={`p-4 transition-colors relative flex flex-col gap-3 border-b border-slate-800/50 last:border-0 ${
                               isVisuallyUnread 
                               ? 'bg-slate-800/40 hover:bg-slate-800/60 shadow-inner' 
                               : 'opacity-60 hover:opacity-100 hover:bg-slate-800/30 grayscale-[50%]'
                           }`}
                        >
                           {/* Clickable Area for Navigation */}
                           <div 
                              onClick={() => handleNotificationClick(notif)}
                              className="flex gap-3 cursor-pointer"
                            >
                               {isVisuallyUnread && (
                                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full mt-[-20px] shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                               )}
                               
                               {/* Icon based on type */}
                               <div className={`flex-shrink-0 mt-1 ${!isVisuallyUnread ? 'opacity-70' : ''}`}>
                                   {notif.type === 'booking_request' ? (
                                       <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center ring-1 ring-blue-500/30">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                             <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                           </svg>
                                       </div>
                                   ) : notif.type === 'booking_accepted' ? (
                                       <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center ring-1 ring-green-500/30">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                            </svg>
                                       </div>
                                   ) : notif.type === 'chat_message' ? (
                                       <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center ring-1 ring-orange-500/30">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm.25-3.5a.75.75 0 1 1-1.5 0v-4.5a.75.75 0 1 1 1.5 0v4.5Z" clipRule="evenodd" />
                                            </svg>
                                       </div>
                                   ) : (
                                       <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center ring-1 ring-red-500/30">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06 1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                                            </svg>
                                       </div>
                                   )}
                               </div>
                               
                               <div>
                                   <p className={`text-sm tracking-wide ${isVisuallyUnread ? 'text-white font-semibold' : 'text-gray-400 font-medium'}`}>
                                     {notif.message}
                                   </p>
                                   <span className={`text-[10px] mt-1 block uppercase tracking-wider font-semibold ${isVisuallyUnread ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                               </div>
                           </div>
                           
                           {/* Inline Action Buttons for Requests */}
                           {notif.type === 'booking_request' && notif.relatedBooking?.status === 'pending' && (
                               <div className="flex gap-2 ml-11 mt-1">
                                   <button 
                                      onClick={(e) => handleBookingAction(e, notif, 'confirmed')}
                                      disabled={actionLoading === notif._id}
                                      className="flex-1 bg-green-600/20 hover:bg-green-600 border border-green-500/50 text-green-400 hover:text-white py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                   >
                                      {actionLoading === notif._id ? '...' : 'Accept'}
                                   </button>
                                   <button 
                                      onClick={(e) => handleBookingAction(e, notif, 'rejected')}
                                      disabled={actionLoading === notif._id}
                                      className="flex-1 bg-red-900/30 hover:bg-red-900 border border-red-800 text-red-400 hover:text-red-200 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                   >
                                      Decline
                                   </button>
                               </div>
                           )}
                        </li>
                        );
                    })}
                 </ul>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
