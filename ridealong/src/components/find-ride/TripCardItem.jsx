import React from 'react';
import Link from 'next/link';

export default function TripCardItem({
    trip,
    myBookings = [],
    handleBookRide,
    bookingLoading
}) {
    const myBooking = myBookings.find(b => b.trip?._id === trip._id);
    const bookingStatus = myBooking ? myBooking.status : null;

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 p-6 rounded-[2rem] shadow-2xl hover:shadow-orange-500/5 hover:border-orange-500/30 transition-all duration-500 group relative ring-1 ring-white/5">
          {/* Driver Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700/50 group-hover:border-orange-500/30 transition-colors">
                <span className="text-lg font-black text-white uppercase">{trip.driver?.name?.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  {trip.driver?.name || "Unknown"}
                  {trip.driver?.isDriverVerified && (
                     <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-blue-400/50 shadow-lg shadow-blue-500/20">
                       <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </div>
                  )}
                </h3>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none mt-1">{trip.vehicleType}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              {bookingStatus && (
                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                     bookingStatus === 'confirmed' ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-orange-900/40 text-orange-400 border-orange-500/20'
                 }`}>
                     {bookingStatus === 'confirmed' ? 'JOINED' : 'REQUESTED'}
                 </span>
              )}
              <div>
                <p className="text-xl font-black text-white tracking-tight leading-none">
                  {trip.distance} <span className="text-[10px] text-slate-500 uppercase">km</span>
                </p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Total Track</p>
              </div>
            </div>
          </div>

          {/* Proximity Indicator */}
          {trip.distanceFromRoute !== undefined && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border transition-colors ${trip.distanceFromRoute < 0.05 ? 'bg-green-950/30 border-green-500/20 group-hover:border-green-500/40' : 'bg-orange-950/30 border-orange-500/20 group-hover:border-orange-500/40'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${trip.distanceFromRoute < 0.05 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Deviation</p>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${trip.distanceFromRoute < 0.05 ? 'text-green-400' : 'text-orange-400 w-1/2 text-right leading-tight'}`}>
                {trip.distanceFromRoute < 0.05 ? "Exact Pickup" : `Walk ${(trip.distanceFromRoute * 1000).toFixed(0)}m to Intersect`}
              </p>
            </div>
          )}

          {/* Route Timeline */}
          <div className="space-y-4 mb-8 relative px-1">
            <div className="absolute left-[7px] top-2 bottom-4 w-[2px] bg-gradient-to-b from-orange-500/50 via-slate-700 to-blue-500/50"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 mt-1 shadow-orange-500/40 ring-4 ring-slate-900"></div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment</p>
                <p className="text-xs font-bold text-slate-200 truncate pr-4">{trip.source}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 mt-1 shadow-blue-500/40 ring-4 ring-slate-900"></div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Objective</p>
                <p className="text-xs font-bold text-slate-200 truncate pr-4">{trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Metrics Footer */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-800/50 mb-6">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black font-mono text-slate-600 uppercase tracking-[0.2em]">ETD</p>
              <p className="text-[10px] font-black text-slate-300">
                {new Date(trip.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                <span className="text-orange-500 mx-1.5">|</span>
                {new Date(trip.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="text-center space-y-0.5">
               <p className="text-[8px] font-black font-mono text-orange-500/70 uppercase tracking-[0.2em]">Fare / Seat</p>
               <p className="text-[14px] font-black text-green-400 tracking-wider drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">₹{trip.pricePerSeat || Math.max(25, Math.floor((trip.distance || 10) * 4))}</p>
            </div>
            <div className="text-right space-y-0.5">
               <p className="text-[8px] font-black font-mono text-slate-600 uppercase tracking-[0.2em]">Capacity</p>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{trip.seats} <span className="text-slate-600">UNITS</span></p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="flex gap-3">
            <Link href={`/trip/${trip._id}`} className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-center border border-slate-700/50 border-slate-600">
              Route Map
            </Link>
            <button 
              onClick={() => handleBookRide(trip._id)} disabled={bookingLoading === trip._id}
              className="flex-[1.5] bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/10 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 border-b-2 border-orange-700"
            >
              {bookingLoading === trip._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Request Booking"}
            </button>
          </div>
        </div>
    );
}
