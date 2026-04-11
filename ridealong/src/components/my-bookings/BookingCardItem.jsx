import React, { useState } from 'react';
import UserProfilePreviewModal from '../trip/UserProfilePreviewModal';

export default function BookingCardItem({ booking, handleCancelBooking, router }) {
    const [previewUserId, setPreviewUserId] = useState(null);

    const statusStyles = {
        confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
        pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20"
    };

    if (!booking || !booking.trip) {
        return (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6 relative overflow-hidden opacity-60 shadow-inner">
               <p className="text-red-400 font-bold font-lg mb-1">Trip Terminated</p>
               <p className="text-gray-500 text-sm">The original driver has permanently deleted this trip record.</p>
               <span className="text-gray-600 text-xs mt-3 block">Booking ID: {booking?._id}</span>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/80 transition group relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyles[booking.status] || statusStyles.cancelled}`}>
                  Request: {booking.status}
                </span>
                {(booking.trip.status === 'cancelled' || booking.trip.status === 'completed' || booking.trip.status === 'in-progress') && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${booking.trip.status === 'cancelled' ? statusStyles.cancelled : booking.trip.status === 'completed' ? statusStyles.completed : 'bg-green-900/40 text-green-400 border-green-500/30'}`}>
                    Trip: {booking.trip.status}
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button 
                 onClick={() => setPreviewUserId(booking.trip.driver?._id)}
                 className="flex items-center gap-4 mb-4 text-left hover:bg-slate-700/30 p-2 -ml-2 rounded-xl transition"
              >
                {booking.trip.driver?.profilePhoto ? (
                  <img src={booking.trip.driver.profilePhoto} alt="Driver" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {booking.trip.driver?.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-white font-medium hover:text-orange-400 transition">{booking.trip.driver?.name}</p>
                  <p className="text-gray-500 text-xs">Drive Profile & Stats →</p>
                </div>
              </button>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20"></div>
                  <div className="w-0.5 h-8 bg-gradient-to-b from-orange-500 to-blue-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-white font-medium text-sm">{booking.trip.source}</p>
                  <p className="text-white font-medium text-sm">{booking.trip.destination}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-6 border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Seats</p>
                <p className="text-orange-400 font-bold text-xl">{booking.seatsBooked}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Date</p>
                <p className="text-white font-semibold">
                  {new Date(booking.trip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-3">
                {(booking.status === "pending" || booking.status === "confirmed") && booking.trip.status !== "cancelled" && booking.trip.status !== "completed" && (
                  <button onClick={() => handleCancelBooking(booking._id)} className="bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 px-4 py-2 rounded-lg text-sm transition font-medium shadow-sm">Cancel</button>
                )}
                <button 
                  onClick={() => {
                     const isHistorical = booking.trip.status === "cancelled" || booking.trip.status === "completed";
                     router.push(`/trip/${booking.trip._id}${isHistorical ? '?history=true' : ''}`);
                  }} 
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition font-medium shadow-sm border border-slate-600"
                >
                  View Trip
                </button>
              </div>
            </div>
          </div>

          {previewUserId && (
              <UserProfilePreviewModal userId={previewUserId} onClose={() => setPreviewUserId(null)} />
          )}
        </div>
    );
}
