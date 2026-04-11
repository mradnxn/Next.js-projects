"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import bg from "@/../public/Ride_along_bg.png";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { getApiUrl } from "@/utils/api";
import { useToast } from "@/components/ToastProvider";

// Sub-components
import TripStep1Details from "@/components/create-trip/TripStep1Details";
import TripStep2Route from "@/components/create-trip/TripStep2Route";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800 w-full h-full rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>,
});

export default function CreateTrip() {
  const router = useRouter();
  const { addToast } = useToast();
  const timeoutRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [userVehicles, setUserVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: "", vehicleType: "", seats: "", mileage: "", source: "", destination: "", distance: "", duration: "", date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState({ source: null, destination: null });
  const [userLocation, setUserLocation] = useState(null);
  const [routeWaypointsData, setRouteWaypointsData] = useState([]);

  useEffect(() => {
    const fetchUserAndVehicles = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/auth/me`, { method: "GET", credentials: "include" });
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        const verifiedVehicles = (data.vehicles || []).filter(v => v.status === "verified");
        setUserVehicles(verifiedVehicles);
        if (verifiedVehicles.length > 0) {
          setForm(prev => ({ ...prev, vehicleId: verifiedVehicles[0]._id, vehicleType: `${verifiedVehicles[0].make} ${verifiedVehicles[0].model}` }));
        }
      } catch (err) { console.error("Error fetching vehicles:", err); }
    };
    fetchUserAndVehicles();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
  }, [router]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.vehicleId || !form.seats || !form.mileage || !form.date) { addToast("Please fill all required fields.", "error"); return; }
    setStep(2);
  };

  const handleBack = (e) => { e.preventDefault(); setStep(1); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vehicleId") {
      const selectedVehicle = userVehicles.find(v => v._id === value);
      setForm({ ...form, vehicleId: value, vehicleType: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "", seats: "" });
    } else { setForm({ ...form, [name]: value }); }
  };

  const abortControllerRef = useRef(null);

  const fetchSuggestions = async (query, field) => {
     if (!query || query.length < 3) {
        if (field === 'source') setSourceSuggestions([]);
        if (field === 'destination') setDestSuggestions([]);
        setAutocompleteLoading(false);
        return;
     }

     if (abortControllerRef.current) abortControllerRef.current.abort();
     abortControllerRef.current = new AbortController();
     const signal = abortControllerRef.current.signal;

     try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
        
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error("Nominatim Lookup Failure");
        
        const data = await res.json();
        if (data && data.length > 0) {
             const formattedData = data.map(f => ({ 
                 display_name: f.display_name, 
                 lat: parseFloat(f.lat), 
                 lng: parseFloat(f.lon), 
                 lon: parseFloat(f.lon) 
             }));
             if (field === 'source') setSourceSuggestions(formattedData);
             if (field === 'destination') setDestSuggestions(formattedData);
        } else {
             if (field === 'source') setSourceSuggestions([]);
             if (field === 'destination') setDestSuggestions([]);
        }
     } catch (error) { 
        if (error.name !== 'AbortError') console.error("Autocomplete fully failed:", error);
     } finally {
        setAutocompleteLoading(false);
     }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value }); setActiveField(name); setSelectedCoords(prev => ({ ...prev, [name]: null }));
      setAutocompleteLoading(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fetchSuggestions(value, name), 900); // 900ms protects against Nominatim's strict 1 request per second IP Ban limit
  };

  const selectSuggestion = (suggestion, field) => {
      setForm(prev => ({ ...prev, [field]: suggestion.display_name }));
      setSelectedCoords(prev => ({ ...prev, [field]: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) } }));
      if (field === 'source') setSourceSuggestions([]); else setDestSuggestions([]);
      setActiveField(null);
  };

  const clearInput = (field) => {
      setForm(prev => ({ ...prev, [field]: "" })); setSelectedCoords(prev => ({ ...prev, [field]: null }));
      if (field === 'source') setSourceSuggestions([]); else setDestSuggestions([]);
      setActiveField(null);
  };

  const useCurrentLocation = () => {
      if (!navigator.geolocation) { addToast("Geolocation is not supported.", "error"); return; }
      navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords(prev => ({ ...prev, source: { lat: latitude, lng: longitude } }));
          try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              if (data && data.display_name) setForm(prev => ({ ...prev, source: data.display_name }));
              else setForm(prev => ({ ...prev, source: `${latitude}, ${longitude}` }));
          } catch (error) { setForm(prev => ({ ...prev, source: `${latitude}, ${longitude}` })); }
      });
  };

  const geocode = async (address) => {
    try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`;
        const res = await fetch(url); const data = await res.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        return null;
    } catch (error) { return null; }
  };

  const handleSearchRoute = async () => {
    if (!form.source || !form.destination) { addToast("Please enter both locations.", "error"); return; }
    setSearching(true);
    let s = selectedCoords.source || await geocode(form.source);
    let e = selectedCoords.destination || await geocode(form.destination);
    if (!s || !e) { addToast("Could not find locations.", "error"); setSearching(false); return; }
    setWaypoints([s, e]); setSearching(false); addToast("Route calculated!", "success");
  };

  const handleRouteDetailsUpdate = useCallback((details) => {
    setForm(prev => {
        if (prev.distance === details.distance && prev.duration === details.duration) return prev;
        return { ...prev, distance: details.distance, duration: details.duration };
    });
    if (details.coordinates) setRouteWaypointsData(details.coordinates);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.distance) { addToast("Please calculate route.", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/trips`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ...form, sourceCoords: selectedCoords.source, destinationCoords: selectedCoords.destination, routeWaypoints: routeWaypointsData }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.msg || "Failed", "error"); return; }
      addToast("Trip published!", "success"); router.push(`/trip/${data.trip._id}`);
    } catch (err) { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative pt-24 pb-12 px-6 overflow-x-hidden bg-[#020617] flex justify-center">
      <Image src={bg} alt="background" fill className="object-cover opacity-20 blur-md -z-10" />

      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 fixed top-0 left-0 w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition group w-20 sm:w-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white invisible sm:visible">Create Trip</h1>
          <div className="w-20 sm:w-40 flex justify-end">
             <NotificationBell />
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-700/50 to-slate-900/50 shadow-2xl">
        <div className="bg-slate-900/90 backdrop-blur-2xl p-8 rounded-2xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Create a Trip</h1>
            <div className="flex items-center gap-4 relative">
                <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-orange-500 text-white" : "bg-slate-700 text-gray-400"}`}>1</div>
                    <span className="text-[10px] uppercase mt-2 font-semibold text-gray-400">Details</span>
                </div>
                <div className={`flex-1 h-[2px] mb-6 ${step > 1 ? "bg-orange-500" : "bg-slate-700"}`}></div>
                <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-orange-500 text-white" : "bg-slate-700 text-gray-400"}`}>2</div>
                    <span className="text-[10px] uppercase mt-2 font-semibold text-gray-400">Route</span>
                </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && <TripStep1Details form={form} handleChange={handleChange} userVehicles={userVehicles} handleNext={handleNext} router={router} />}
            {step === 2 && (
               <TripStep2Route 
                  form={form} activeField={activeField} sourceSuggestions={sourceSuggestions} destSuggestions={destSuggestions} 
                  handleInputChange={handleInputChange} clearInput={clearInput} useCurrentLocation={useCurrentLocation} 
                  selectSuggestion={selectSuggestion} handleSearchRoute={handleSearchRoute} searching={searching} 
                  waypoints={waypoints} handleRouteDetailsUpdate={handleRouteDetailsUpdate} handleBack={handleBack} 
                  loading={loading} MapWrapper={MapWrapper} autocompleteLoading={autocompleteLoading}
               />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
