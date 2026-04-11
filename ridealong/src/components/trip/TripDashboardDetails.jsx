import React, { useState, useEffect } from 'react';

export default function TripDashboardDetails({ 
    trip, 
    isInProgress, 
    isDriver, 
    driverLocation, 
    getTimeSinceUpdate,
    handleCancelTrip
}) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // UI updates every minute
        return () => clearInterval(interval);
    }, []);

    const tripTime = trip?.date ? new Date(trip.date) : null;
    const delayMinutes = tripTime ? Math.floor((now - tripTime) / 60000) : 0;
    const isDelayed = trip?.status === 'scheduled' && delayMinutes > 0;

    return (
        <div className="flex-1 space-y-6">
            <div className={`p-4 rounded-lg border ${trip?.status === 'in-progress' ? 'bg-green-900/50 border-green-500' : 'bg-blue-900/50 border-transparent'}`}>
                <p className="text-xs text-blue-300 uppercase tracking-wide">Status</p>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    <p className={`text-xl font-semibold capitalize ${trip?.status === 'in-progress' ? 'text-green-400' : trip?.status === 'cancelled' ? 'text-red-400' : 'text-white'}`}>
                        {trip?.status === 'in-progress' ? 'In Progress' : (trip?.status || "Scheduled")}
                    </p>
                    {isDelayed && (
                       <span className={`text-sm font-medium ${isDriver ? 'text-orange-400 animate-pulse' : 'text-yellow-400'}`}>
                           {isDriver ? '⚠️ Time to start your ride!' : `(Delayed by ${delayMinutes} min${delayMinutes !== 1 ? 's' : ''})`}
                       </span>
                    )}
                </div>
                {trip?.status === "cancelled" && trip?.cancelReason && (
                    <p className="text-red-400 text-sm mt-3 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                        {trip.cancelReason}
                    </p>
                )}
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg text-sm text-gray-300 space-y-4">
                 <div>
                    <span className="text-xs text-gray-500 block mb-1">FROM</span>
                    <div className="font-medium text-white">{trip?.source}</div>
                 </div>
                 <div className="w-full h-px bg-gray-700"></div>
                 <div>
                    <span className="text-xs text-gray-500 block mb-1">TO</span>
                    <div className="font-medium text-white">{trip?.destination}</div>
                 </div>
            </div>

            <div className="flex flex-row gap-3">
               <div className="flex-1 bg-blue-900/10 p-4 rounded-lg border border-blue-500/20 flex flex-col items-center justify-center">
                   <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Seats Left</span>
                   <span className="text-2xl font-black text-orange-400">{trip?.seats}</span>
               </div>
               <div className="flex-1 bg-green-900/10 p-4 rounded-lg border border-green-500/20 flex flex-col items-center justify-center shadow-inner shadow-green-500/5">
                   <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Price</span>
                   <span className="text-2xl font-black text-green-400">₹{trip?.pricePerSeat || Math.max(25, Math.floor((trip?.distance || 10) * 4))}</span>
               </div>
            </div>

            {isInProgress && (
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${driverLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <p className="text-sm font-medium text-white">
                    {isDriver ? 'Sharing your location' : 'Tracking driver'}
                  </p>
                </div>
                {getTimeSinceUpdate() && (
                  <p className="text-xs text-gray-400">
                    Last updated: {getTimeSinceUpdate()}
                  </p>
                )}
                {driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {driverLocation.lat.toFixed(4)}, Lng: {driverLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {trip?.status !== 'completed' && trip?.status !== 'cancelled' && (
                <div className="flex items-center gap-3 bg-blue-900/20 p-3 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${trip?.status === 'in-progress' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'} `}></div>
                    <p className="text-gray-300 text-sm font-medium">
                        {trip?.status === 'in-progress' ? 'Ride is active...' : 'Waiting for passengers...'}
                    </p>
                </div>
            )}

            {isDriver && trip?.status === 'scheduled' && (
               <div className="pt-4 border-t border-slate-800">
                   <button 
                     onClick={handleCancelTrip}
                     className="w-full py-3 bg-red-900/40 hover:bg-red-900 border border-red-800/50 text-red-400 rounded-xl text-sm font-semibold transition"
                   >
                     Cancel Trip
                   </button>
               </div>
            )}
        </div>
    );
}
