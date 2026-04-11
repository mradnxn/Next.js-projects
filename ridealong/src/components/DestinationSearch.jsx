"use client";

import { useState, useEffect, useRef } from "react";

export default function DestinationSearch({ onDestinationSelect, initialValue = "" }) {
  const [destination, setDestination] = useState(initialValue);

  useEffect(() => {
    if (initialValue) {
        setDestination(initialValue);
    }
  }, [initialValue]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const debounceTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation not available:", error);
          // Fallback to India center if location not available
          setUserLocation({ lat: 20.5937, lng: 78.9629 });
        }
      );
    } else {
      // Fallback to India center
      setUserLocation({ lat: 20.5937, lng: 78.9629 });
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abortControllerRef = useRef(null);

  // Fetch suggestions as user types
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;

      // Add viewbox to prioritize results near user's location geographically
      if (userLocation) {
        const radius = 2; // Roughly 2 degrees mapping
        url += `&viewbox=${userLocation.lng - radius},${userLocation.lat + radius},${userLocation.lng + radius},${userLocation.lat - radius}&bounded=0`;
      }

      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error("Nominatim Lookup Failure");
      
      const data = await response.json();

      if (data && data.length > 0) {
        const formattedData = data.map(f => {
            return {
                display_name: f.display_name,
                address: f.address,
                lat: parseFloat(f.lat),
                lon: parseFloat(f.lon)
            };
        });

        setSuggestions(formattedData);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error("Error fetching suggestions:", error);
      // Suppress state clears actively if aborted, so the older queries don't erase newer pending states
      if (error.name !== 'AbortError') setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestination(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (value.trim().length >= 2) {
        setIsFetchingSuggestions(true);
    } else {
        setIsFetchingSuggestions(false);
    }

    // Debounce API calls (wait 900ms to stay strictly under Nominatim's IP Ban limitations)
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 900);
  };

  const handleSuggestionClick = (suggestion) => {
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      name: suggestion.display_name,
    };
    
    setDestination(suggestion.display_name);
    setSelectedCoords(coords);
    setShowSuggestions(false);
    setSuggestions([]);
    onDestinationSelect(coords);
  };

  const handleSearch = async () => {
    if (!destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    // If already selected from suggestions, use that
    if (selectedCoords) {
      onDestinationSelect(selectedCoords);
      return;
    }

    setIsSearching(true);

    try {
      // Use Nominatim geocoding API with location bias
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        destination
      )}&limit=1`;

      if (userLocation) {
        const radius = 2;
        const viewbox = `${userLocation.lng - radius},${userLocation.lat + radius},${
          userLocation.lng + radius
        },${userLocation.lat - radius}`;
        url += `&viewbox=${viewbox}&bounded=0`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name,
        };
        setSelectedCoords(coords);
        onDestinationSelect(coords);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setDestination("");
    setSelectedCoords(null);
    setSuggestions([]);
    setShowSuggestions(false);
    onDestinationSelect(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Format suggestion display text
  const formatSuggestion = (suggestion) => {
    const address = suggestion.address || {};
    const parts = [];
    
    if (address.road || address.neighbourhood) {
      parts.push(address.road || address.neighbourhood);
    }
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.state) {
      parts.push(address.state);
    }
    
    return parts.length > 0 ? parts.join(", ") : suggestion.display_name;
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 ring-1 ring-white/5 p-8 rounded-2xl shadow-2xl mb-8 group" ref={wrapperRef}>
      <div className="flex justify-between items-end mb-6 px-1">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
            Journey Setup
          </label>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Where do you want to go?
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={destination}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search destination (e.g., Delhi, Mumbai)"
              className="w-full px-5 py-4 pr-12 bg-slate-950/50 border border-slate-800/50 rounded-2xl text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-slate-700 hover:bg-slate-800/50"
            />
            {isFetchingSuggestions && (
               <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
               </div>
            )}
            
            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-[100] w-full mt-3 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar ring-1 ring-white/5 slide-in-from-top-2 animate-in duration-200">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-5 py-4 hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 last:border-b-0 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-orange-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {formatSuggestion(suggestion)}
                      </p>
                      <p className="text-gray-500 text-[11px] truncate mt-0.5 uppercase tracking-wider font-medium">
                        {suggestion.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.98] border-b-4 border-orange-700 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Find Rides
              </>
            )}
          </button>
        </div>

        {selectedCoords && (
          <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex items-start justify-between animate-in zoom-in-95 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-orange-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-widest">
                  Destination Locked
                </p>
                <p className="text-white font-bold text-sm leading-snug">
                  {selectedCoords.name}
                </p>
                <div className="flex gap-4">
                  <p className="text-slate-500 text-[10px] font-mono">
                    LAT {selectedCoords.lat.toFixed(4)}
                  </p>
                  <p className="text-slate-500 text-[10px] font-mono">
                    LNG {selectedCoords.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all border border-slate-700/50"
              title="Clear selection"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
