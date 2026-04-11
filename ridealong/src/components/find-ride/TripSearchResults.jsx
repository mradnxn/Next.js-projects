import React from 'react';
import TripCardItem from './TripCardItem';

export default function TripSearchResults({
    trips = [],
    myBookings = [],
    handleBookRide,
    bookingLoading,
    selectedDestination,
    handleDestinationSelect
}) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  Available Assets
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full border border-orange-400 shadow-lg shadow-orange-500/20">
                    {trips.length}
                  </span>
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Verified routes matching your destination parameters
                </p>
              </div>

              {selectedDestination && (
                <button 
                  onClick={() => handleDestinationSelect(selectedDestination)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-orange-500/20 shadow-lg group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m13 13v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Sync Fleet
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <TripCardItem 
                   key={trip._id} trip={trip} myBookings={myBookings} handleBookRide={handleBookRide} bookingLoading={bookingLoading} 
                />
              ))}
            </div>
        </div>
    );
}
