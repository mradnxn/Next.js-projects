"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";
import DestinationSearch from "@/components/DestinationSearch";
import { useToast } from "@/components/ToastProvider";

// Sub-components
import TripSearchResults from "@/components/find-ride/TripSearchResults";
import TripEmptyStates from "@/components/find-ride/TripEmptyStates";

export default function FindRideClient() {
  const { addToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchMyBookings = async () => {
         try {
             const res = await fetch(`${getApiUrl()}/api/bookings/my-bookings`, { credentials: "include" });
             if (res.ok) { const data = await res.json(); setMyBookings(data); }
         } catch (err) { console.error("Error fetching my bookings:", err); }
    };
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude, address: "Current Location" });
        },
        (error) => {
          if (error.code === 1) addToast("Location blocked!", "error");
        }
      );
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => { if (typeof window !== 'undefined') sessionStorage.setItem("findRideScroll", window.scrollY.toString()); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (trips.length > 0 && typeof window !== 'undefined') {
         const scrollY = sessionStorage.getItem("findRideScroll");
         if (scrollY) { setTimeout(() => { window.scrollTo({ top: parseFloat(scrollY), behavior: "auto" }); }, 200); }
    }
  }, [trips]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
         const p = new URLSearchParams(window.location.search);
         const lat = p.get("tripLat"); const lng = p.get("tripLng"); const name = p.get("tripName");
         const pickLat = p.get("pickLat"); const pickLng = p.get("pickLng");
         
         if (pickLat && pickLng) setUserLocation({ lat: parseFloat(pickLat), lng: parseFloat(pickLng), address: "Current Location" });
         if (lat && lng) handleDestinationSelect({ lat: parseFloat(lat), lng: parseFloat(lng), name: name || "" }, pickLat && pickLng ? { lat: parseFloat(pickLat), lng: parseFloat(pickLng) } : null);
    }
  }, []);

  const handleDestinationSelect = async (coords, overrideLocation = null) => {
    setSelectedDestination(coords);
    if (coords && typeof window !== 'undefined') {
         const url = new URL(window.location.href);
         url.searchParams.set("tripLat", coords.lat); url.searchParams.set("tripLng", coords.lng); url.searchParams.set("tripName", coords.name || 'Destination');
         const curLoc = overrideLocation || userLocation;
         if (curLoc) { url.searchParams.set("pickLat", curLoc.lat); url.searchParams.set("pickLng", curLoc.lng); }
         window.history.replaceState({ ...window.history.state }, "", url.toString());
    }
    if (!coords) { setTrips([]); setSearchPerformed(false); setError(""); return; }

    setLoading(true); setError(""); setSearchPerformed(true);

    try {
      const urlStr = `${getApiUrl()}/api/trips`;
      const url = new URL(urlStr, window.location.origin);
      url.searchParams.append("dropLat", coords.lat); url.searchParams.append("dropLng", coords.lng);
      const loc = overrideLocation || userLocation;
      if (loc) { url.searchParams.append("pickupLat", loc.lat); url.searchParams.append("pickupLng", loc.lng); }
      url.searchParams.append("maxDistance", "50");
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to search trips");
      const data = await res.json();
      setTrips(data);
    } catch (err) { setError(err.message); setTrips([]); } finally { setLoading(false); }
  };

  const handleBookRide = async (tripId) => {
    setBookingLoading(tripId);
    try {
      const res = await fetch(`${getApiUrl()}/api/bookings`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ tripId, seatsBooked: 1, pickupLocation: userLocation ? { lat: userLocation.lat, lng: userLocation.lng, address: userLocation.address } : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to book ride");
      addToast("🎉 Booking request sent!", "success");
      handleDestinationSelect(selectedDestination);
    } catch (err) { addToast(err.message, "error"); } finally { setBookingLoading(null); }
  };

  return (
    <>

      <div className="max-w-2xl mx-auto mb-12 relative z-[60]">
        <DestinationSearch onDestinationSelect={handleDestinationSelect} initialValue={selectedDestination?.name || ""} />
      </div>

      <div className="max-w-4xl mx-auto mb-12">
         <TripEmptyStates loading={loading} error={error} selectedDestination={selectedDestination} searchPerformed={searchPerformed} trips={trips} handleDestinationSelect={handleDestinationSelect} />
      </div>

      {!loading && trips.length > 0 && (
         <TripSearchResults trips={trips} myBookings={myBookings} handleBookRide={handleBookRide} bookingLoading={bookingLoading} selectedDestination={selectedDestination} handleDestinationSelect={handleDestinationSelect} />
      )}
    </>
  );
}
