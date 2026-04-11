import React from 'react';

export default function TripStep2Route({
    form,
    activeField,
    sourceSuggestions,
    destSuggestions,
    handleInputChange,
    clearInput,
    useCurrentLocation,
    selectSuggestion,
    handleSearchRoute,
    searching,
    waypoints,
    handleRouteDetailsUpdate,
    handleBack,
    loading,
    MapWrapper,
    autocompleteLoading
}) {
    // Condition to check if routing should be unclickable (unless they are valid text inputs ready for calculation)
    const isRouteReady = form.source?.length > 2 && form.destination?.length > 2;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-4">
              {/* Source Input */}
              <div className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Source</label>
                  <button type="button" onClick={useCurrentLocation} className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition uppercase tracking-widest flex items-center gap-1">📍 Use My Location</button>
                </div>
                <div className="relative">
                  <input
                    name="source" autoComplete="off" placeholder="Enter start location..." onChange={handleInputChange} value={form.source}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 pr-10" required
                  />
                  {form.source && (
                    <button type="button" onClick={() => clearInput('source')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
                  )}
                </div>
                {/* Suggestions Loading Indicator */}
                {activeField === 'source' && autocompleteLoading && (
                  <div className="absolute z-[60] w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg mt-2 p-4 flex justify-center items-center gap-3">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-400 animate-pulse font-medium">Searching maps...</span>
                  </div>
                )}
                {/* Suggestions List */}
                {activeField === 'source' && !autocompleteLoading && sourceSuggestions.length > 0 && (
                  <div className="absolute z-[60] w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl mt-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {sourceSuggestions.map((s, i) => (
                      <div key={i} onClick={() => selectSuggestion(s, 'source')} className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-sm text-gray-200 border-b border-slate-700 last:border-0">{s.display_name}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative group">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Destination</label>
                <div className="relative">
                  <input
                    name="destination" autoComplete="off" placeholder="Enter end location..." onChange={handleInputChange} value={form.destination}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 pr-10" required
                  />
                  {form.destination && (
                    <button type="button" onClick={() => clearInput('destination')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
                  )}
                </div>
                {/* Suggestions Loading Indicator */}
                {activeField === 'destination' && autocompleteLoading && (
                  <div className="absolute z-[60] w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg mt-2 p-4 flex justify-center items-center gap-3">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-400 animate-pulse font-medium">Searching maps...</span>
                  </div>
                )}
                {/* Suggestions List */}
                {activeField === 'destination' && !autocompleteLoading && destSuggestions.length > 0 && (
                  <div className="absolute z-[60] w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl mt-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {destSuggestions.map((s, i) => (
                      <div key={i} onClick={() => selectSuggestion(s, 'destination')} className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-sm text-gray-200 border-b border-slate-700 last:border-0">{s.display_name}</div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="button" 
                onClick={handleSearchRoute} 
                disabled={searching || !isRouteReady} 
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${isRouteReady && !searching ? 'bg-orange-500 border border-orange-400 hover:bg-orange-600 shadow-lg shadow-orange-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                {searching ? "Calculating..." : "Calculate Route"}
              </button>
            </div>

            <div className="h-64 w-full rounded-2xl border border-slate-700 overflow-hidden relative z-0">
              <MapWrapper waypoints={waypoints} setRouteDetails={handleRouteDetailsUpdate} />
              {searching && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {form.distance && (
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex justify-between items-center animate-in zoom-in-95 duration-300">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-orange-400">Distance</p>
                    <p className="text-lg font-bold text-white">{form.distance} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-orange-400">Est. Duration</p>
                    <p className="text-lg font-bold text-white">{form.duration} min</p>
                  </div>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={handleBack} className="flex-1 py-4 border border-slate-700 text-gray-300 rounded-xl font-bold hover:bg-slate-800 transition">Back</button>
              <button type="submit" disabled={loading || !form.distance} className="flex-[2] bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition disabled:opacity-50">
                {loading ? "Publishing..." : "Publish Trip"}
              </button>
            </div>
        </div>
    );
}
