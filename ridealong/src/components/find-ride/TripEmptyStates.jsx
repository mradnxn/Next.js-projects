import React from 'react';

export default function TripEmptyStates({
    loading,
    error,
    selectedDestination,
    searchPerformed,
    trips = [],
    handleDestinationSelect
}) {
    if (loading) {
       return (
            <div className="text-center py-20 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 border-r-2 border-r-orange-500/30"></div>
              <p className="text-white font-bold text-lg mt-6">Scanning the network...</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Checking real-time availability</p>
            </div>
       );
    }

    if (error) {
       return (
            <div className="text-center bg-red-900/20 border border-red-500/30 p-8 rounded-3xl animate-in shake duration-500">
              <p className="text-red-400 font-bold">{error}</p>
            </div>
       );
    }

    if (!selectedDestination && !searchPerformed) {
       return (
            <div className="text-center text-slate-400 bg-slate-900/40 backdrop-blur-xl p-16 rounded-3xl border border-slate-800/50">
              <h2 className="text-2xl font-black text-white mb-2">Target Destination Required</h2>
              <p className="text-sm font-medium opacity-70 tracking-wide uppercase text-[10px]">Enter coordinates to discover active routes</p>
            </div>
       );
    }

    if (searchPerformed && trips.length === 0) {
       return (
            <div className="text-center text-slate-400 bg-slate-900/40 backdrop-blur-xl p-16 rounded-3xl border border-slate-800/50">
              <h2 className="text-2xl font-black text-white mb-2">Null Sector Detected</h2>
              <p className="text-sm font-medium opacity-70 tracking-wide uppercase text-[10px] mb-6">No active routes found for the specified target.</p>
              <button 
                onClick={() => handleDestinationSelect(selectedDestination)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-orange-500/20 animate-bounce mt-4"
              >
                Retry Node Scan
              </button>
            </div>
       );
    }

    return null;
}
