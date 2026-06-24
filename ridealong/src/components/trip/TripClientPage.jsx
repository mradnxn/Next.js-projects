"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bg from "@/../public/Ride_along_bg.png";
import dynamic from "next/dynamic";
import { getApiUrl } from "@/utils/api";

// Sub-components
import TripDashboardDetails from "./TripDashboardDetails";
import TripBookingRequests from "./TripBookingRequests";
import TripLiveChat from "./TripLiveChat";
import TripRatingModal from "./TripRatingModal";
import NotificationBell from "@/components/NotificationBell";
import { io } from "socket.io-client";

import { getPolylineIntersection } from "@/utils/geospatial";
import TripPenaltyWarning from "./TripPenaltyWarning";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800">
         <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
         <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Map Engine...</p>
      </div>
    ),
});

export default function TripClientPage({ initialTrip, id }) {
  const router = useRouter();
  
  const [trip, setTrip] = useState(initialTrip);
  const [loading, setLoading] = useState(!initialTrip);
  const [driverLocation, setDriverLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isDriver, setIsDriver] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'chat'
  const [messages, setMessages] = useState([]);
  const [myBooking, setMyBooking] = useState(null);
  const [riderCurrentLoc, setRiderCurrentLoc] = useState(null);
  const [riderMeetupPath, setRiderMeetupPath] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [deferMap, setDeferMap] = useState(true);
  const [reviewedTargets, setReviewedTargets] = useState([]);
  const [showRatingModalFor, setShowRatingModalFor] = useState(null);
  const [isHistory, setIsHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const locationIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('history') === 'true') setIsHistory(true);
      }
  }, []);

  // Derived state
  const isScheduled = !trip?.status || trip.status === 'scheduled';
  const isInProgress = trip?.status === 'in-progress';
  const isCompleted = trip?.status === 'completed';

  // Instant Page Rendering Deferred Map Logic
  useEffect(() => {
    // We intentionally delay map rendering by 300ms so the left-side dashboard 
    // strictly paints instantly without any Leaflet bundle blocking the CPU frame.
    const timer = setTimeout(() => setDeferMap(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // High-Performance WebSocket Real-Time Connection
  const socketRef = useRef(null);
  useEffect(() => {
    if (!id || isHistory) return;
    
    // Connect directly to the custom Next.js Server wrapper on port 3000
    // Limit reconnection attempts in serverless environments to prevent request spam
    socketRef.current = io({
      path: "/socket.io",
      reconnectionAttempts: 2,
      reconnectionDelay: 5000,
      timeout: 10000
    });
    
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join_trip", id);
    });

    // 1. Silent Live Maps Payload
    socketRef.current.on("driver_location", (location) => {
      setDriverLocation(location);
      setLastUpdate(new Date());
    });

    // 2. Ultra-Fast Chat Messaging Protocol (and hidden system payload receiver)
    socketRef.current.on("chat_message", (message) => {
      // Intercept system payload piggybacking on the chat socket avoiding a manual Node server reboot!
      if (message && message._internal_trip_status) {
         setTrip(prev => prev ? { ...prev, status: message._internal_trip_status } : prev);
         return;
      }
      setMessages((prev) => {
        // Prevent duplicate messages if already polled
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_trip", id);
        socketRef.current.disconnect();
      }
    };
  }, [id, isHistory]);

  // Load initial chat messages on mount
  useEffect(() => {
    if (!id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/trips/${id}/messages`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [id]);

  // Consolidated Polling Sync Hook (chat, bookings, location, and trip status)
  // Stops network spam by grouping multiple separate timers into one balanced tick.
  useEffect(() => {
    if (!id || isHistory || isCompleted) return;

    const performSync = async () => {
      try {
        const isSocketActive = socketRef.current && socketRef.current.connected;

        // A. Poll Messages (Only if WebSocket is disconnected)
        if (!isSocketActive) {
          const msgRes = await fetch(`${getApiUrl()}/api/trips/${id}/messages`, { credentials: "include" });
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            if (Array.isArray(msgData)) {
              setMessages(msgData);
            }
          }
        }

        // B. Poll Bookings (Only for Driver to verify requests)
        if (isDriver) {
          const bookingsRes = await fetch(`${getApiUrl()}/api/trips/${id}/bookings`, { credentials: "include" });
          if (bookingsRes.ok) {
            const data = await bookingsRes.json();
            setBookings(data);
          }
        }

        // C. Poll Trip Details (For Passenger to sync Driver Location, and sync overall Cancellation/Auto-Status)
        const tripRes = await fetch(`${getApiUrl()}/api/trips/${id}`);
        if (tripRes.ok) {
          const tripData = await tripRes.json();
          // Passenger Location Sync
          if (!isDriver && tripData.currentLocation) {
            setDriverLocation(tripData.currentLocation);
            setLastUpdate(new Date(tripData.lastLocationUpdate || Date.now()));
          }
          // General Trip Status Sync
          if (tripData.status && tripData.status !== trip?.status) {
            setTrip(tripData);
          }
        }
      } catch (err) {
        console.error("Consolidated Sync error:", err);
      }
    };

    // Initial check
    performSync();

    // Use a faster rate (4s) during active trips, and slower rate (8s) otherwise to save network/CPU
    const intervalTime = isInProgress ? 4000 : 8000;
    const interval = setInterval(performSync, intervalTime);

    return () => clearInterval(interval);
  }, [id, isHistory, isCompleted, isDriver, isInProgress, trip?.status]);


  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        } else if (res.status === 401) {
          router.push("/login"); // Unauthorized
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, [router]);

  // Phase 2 Trust System: Fetch Historical User Reviews for this Trip
  useEffect(() => {
    // Both officially completed routes AND forcibly cancelled trips require rating verification locks
    if (!id || (!isCompleted && trip?.status !== 'cancelled')) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/trips/${id}/review`, { credentials: "include" });
        if (res.ok) {
           const data = await res.json();
           setReviewedTargets(data.reviewedTargets || []);
        }
      } catch (err) {}
    };
    fetchReviews();
  }, [id, isCompleted, trip?.status]);

  // Cinematic Trust Modal Trigger: Pop the review panel safely after the ride ends or cancels
  useEffect(() => {
      // Both completed rides and cancelled rides (by delay) warrant driver rating feedback from active riders
      if ((isCompleted || trip?.status === 'cancelled') && currentUser && !isHistory) {
          // Passengers rate the Driver
          if (!isDriver && myBooking) {
               const driverId = typeof trip?.driver === 'object' ? trip.driver._id : trip?.driver;
               if (driverId && !reviewedTargets.includes(driverId)) {
                   // Delay so the rider registers the screen text "COMPLETED/CANCELLED" first
                   const timer = setTimeout(() => setShowRatingModalFor(trip.driver), 4000);
                   return () => clearTimeout(timer);
               }
          }
      }
  }, [isCompleted, trip?.status, isDriver, currentUser, reviewedTargets, trip?.driver, myBooking, isHistory]);

  // Poll Trip Status securely catching 15-minute backend chron validation
  useEffect(() => {
      // Only ping if trip theoretically active
      if (!id || isCompleted || isHistory || trip?.status === 'cancelled') return;
      const syncTrip = async () => {
          try {
              const res = await fetch(`${getApiUrl()}/api/trips/${id}`);
              if (res.ok) {
                  const data = await res.json();
                  if (data.status === 'cancelled') setTrip(data); 
              }
          } catch(e) {}
      };
      const intId = setInterval(syncTrip, 15000); // 15s checks
      return () => clearInterval(intId);
  }, [id, isCompleted, isHistory, trip?.status]);

  // Fetch trip details if not loaded on Server
  useEffect(() => {
    if (initialTrip) return;
    const fetchTrip = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/api/trips/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTrip(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    if (id) fetchTrip();
  }, [id, initialTrip]);

  // Check if current user is due driver
  useEffect(() => {
    if (trip && currentUser) {
      const driverId = typeof trip.driver === 'object' ? trip.driver._id : trip.driver;
      setIsDriver(currentUser._id === driverId);
    }
  }, [trip, currentUser]);

  // Removed the 'Redirect on Cancellation' useEffect entirely so users can view read-only cancelled trips.

  // Historical fetch for bookings for Driver (if it's completed and History, we still need bookings to show the riders routes)
  useEffect(() => {
    if (!isDriver || !id || !isHistory) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/trips/${id}/bookings`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchBookings();
  }, [isDriver, id, isHistory]);


  // Phase 3: Passenger Map Synchronization
  // Pull the rider's personal booking parameters specifically so they can visualize their own pickup intersection!
  useEffect(() => {
     if (isDriver || !currentUser || !id) return;
     const fetchMyBooking = async () => {
         try {
             // We use regular fetch not polling
             const res = await fetch(`${getApiUrl()}/api/bookings/my-bookings`, { credentials: "include" });
             if (res.ok) {
                 const data = await res.json();
                 const specificBooking = data.find(b => b.trip?._id === id || b.trip === id);
                 if (specificBooking) setMyBooking(specificBooking);
             }
         } catch(e){}
     };
     fetchMyBooking();
  }, [isDriver, currentUser, id]);

  const [historicalRiderPaths, setHistoricalRiderPaths] = useState([]);

  // Phase 4 & Historical Walking Path Routing: Now services both active and historical trips robustly via OSRM
  useEffect(() => {
      if (!trip) return;
      const allTripPoints = [trip.sourceCoords, ...(trip.routeWaypoints || []), trip.destinationCoords].filter(p => p && p.lat);

      const fetchWalkingPath = async (startExt, endExt) => {
          const coordStr = `${startExt.lng},${startExt.lat};${endExt.lng},${endExt.lat}`;
          try {
              // Use FOSSGIS OSRM foot router which avoids the "giant circle" driving logic
              const ping = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordStr}?overview=full&geometries=geojson`);
              const payload = await ping.json();
              if (payload.routes && payload.routes[0]) return payload.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          } catch(e) {}
          return [ [startExt.lat, startExt.lng], [endExt.lat, endExt.lng] ];
      };

      if (!isHistory) {
          // ACTIVE TRIP (Passenger only)
          if (isDriver || !myBooking || !myBooking.pickupLocation) return;
          const rLoc = riderCurrentLoc || myBooking.pickupLocation;
          const meetingPoint = getPolylineIntersection(rLoc.lat, rLoc.lng, allTripPoints);
          
          if (meetingPoint) {
              const distToMeet = Math.sqrt((rLoc.lat - meetingPoint.lat)**2 + (rLoc.lng - meetingPoint.lng)**2);
              if (distToMeet < 0.0005) { setRiderMeetupPath(null); return; }
              fetchWalkingPath(rLoc, meetingPoint).then(path => setRiderMeetupPath(path));
          }
      } else {
          // HISTORICAL TRIP: Batch fetch sequential to prevent FOSSGIS 429 Rate Limits
          if (isDriver) {
              // As requested, drivers checking histories only want to see their vehicle route and interception markers, NOT the blue dotted walking geometries of the passengers
              setHistoricalRiderPaths([]);
              return;

          } else if (myBooking && myBooking.pickupLocation && trip.destinationCoords) {
              const rLoc = myBooking.pickupLocation;
              const meetingPoint = getPolylineIntersection(rLoc.lat, rLoc.lng, allTripPoints);
              if (meetingPoint) {
                  const distToMeet = Math.sqrt((rLoc.lat - meetingPoint.lat)**2 + (rLoc.lng - meetingPoint.lng)**2);
                  if (distToMeet > 0.0005) {
                      fetchWalkingPath(rLoc, meetingPoint).then(path => setHistoricalRiderPaths([path]));
                  }
              }
          }
      }
  }, [isDriver, myBooking, trip, riderCurrentLoc, isHistory, bookings]);

  // Update Driver Location (Broadcasting)
  const updateDriverLocation = async (lat, lng) => {
    if (socketRef.current) {
       socketRef.current.emit('driver_location_update', { tripId: id, lat, lng });
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/trips/${id}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lat, lng }),
      });
      if (res.ok) {
        setDriverLocation({ lat, lng });
        setLastUpdate(new Date());
      }
    } catch (err) { console.error(err); }
  };

  // Start Location Tracking for Driver and Passenger
  const startLocationTracking = () => {
    if (!navigator.geolocation || isHistory) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (isDriver) updateDriverLocation(latitude, longitude);
        else {
           setRiderCurrentLoc({ lat: latitude, lng: longitude });
           updatePassengerLocation(latitude, longitude);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const updatePassengerLocation = async (lat, lng) => {
    try {
      await fetch(`${getApiUrl()}/api/trips/${id}/rider-location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lat, lng }),
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!isDriver && currentUser && !isCompleted && !isHistory) startLocationTracking();
    return () => stopLocationTracking();
  }, [isDriver, currentUser, isCompleted, isHistory]);

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Status Handlers
  const handleStatusUpdate = async (newStatus) => {
      try {
          const res = await fetch(`${getApiUrl()}/api/trips/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              const updatedTrip = await res.json();
              setTrip(updatedTrip);
              if (socketRef.current) socketRef.current.emit("new_chat_message", { tripId: id, message: { _internal_trip_status: newStatus } });
              if (newStatus === 'in-progress') startLocationTracking();
              else if (newStatus === 'completed') {
                  stopLocationTracking();
                  setTimeout(() => router.push('/dashboard'), 2000);
              }
          }
      } catch (e) { console.error(e); }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
      setActionLoading(bookingId);
      try {
         const res = await fetch(`${getApiUrl()}/api/bookings/${bookingId}`, {
             method: "PATCH",
             headers: { "Content-Type": "application/json" },
             credentials: "include",
             body: JSON.stringify({ status: newStatus })
         });
         const data = await res.json();
         if (res.ok) {
             setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
             if (newStatus === 'confirmed') setTrip(prev => ({ ...prev, seats: prev.seats - data.booking.seatsBooked }));
         }
      } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleCancelTrip = async () => {
       if (!confirm("Are you sure you want to cancel this trip?")) return;
       try {
            const res = await fetch(`${getApiUrl()}/api/trips/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "cancelled" })
            });
            if (res.ok) setTrip(prev => ({ ...prev, status: "cancelled" }));
       } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || sending || isHistory) return;
      setSending(true);
      try {
           const res = await fetch(`${getApiUrl()}/api/trips/${id}/messages`, {
               method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: newMessage })
           });
           if (res.ok) {
               const data = await res.json();
               setMessages(prev => [...prev, data]);
               setNewMessage("");
               if (socketRef.current) socketRef.current.emit("new_chat_message", { tripId: id, message: data });
           }
      } catch (err) { console.error(err); } finally { setSending(false); }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return null;
    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const waypoints = trip && trip.sourceCoords && trip.destinationCoords ? [trip.sourceCoords, trip.destinationCoords] : [];
  const allMarkers = [...waypoints];
  if (driverLocation && driverLocation.lat && driverLocation.lng) allMarkers.push({ ...driverLocation, isDriver: true });

  let riderLocations = [];
  if (isDriver && !(isHistory && trip?.status === 'cancelled')) {
      const allTripPoints = trip ? [trip.sourceCoords, ...(trip.routeWaypoints || []), trip.destinationCoords].filter(p => p && p.lat) : [];

      bookings
        .filter(b => (b.status === 'confirmed' || b.status === 'pending') && ((b.currentLocation && b.currentLocation.lat) || (b.pickupLocation && b.pickupLocation.lat)))
        .forEach(b => {
            const loc = b.currentLocation?.lat ? b.currentLocation : b.pickupLocation;
            const meetingPoint = getPolylineIntersection(loc.lat, loc.lng, allTripPoints);
            const riderName = b.rider?.name ? b.rider.name.split(' ')[0] : "Rider";

            const distToMeet = meetingPoint ? Math.sqrt((loc.lat - meetingPoint.lat)**2 + (loc.lng - meetingPoint.lng)**2) : 999;
            const isAtMeetingPoint = distToMeet < 0.0005;

            if (!isAtMeetingPoint) {
                // Push the Rider's active remote location (Light / Faded Marker) ONLY IF ACTIVE
                if (!isHistory) {
                    riderLocations.push({
                        ...loc,
                        name: `${riderName} (Walking)`,
                        status: 'pending' 
                    });
                }

                // Push the Mathematical Meeting Intersection on the Route (Dark / Bold Marker)
                if (meetingPoint) {
                    riderLocations.push({
                        ...meetingPoint,
                        name: `${isHistory ? 'Met' : 'Meet'} ${riderName} HERE`,
                        status: 'confirmed'
                    });
                }
            } else {
                // Rider has arrived at the meetup spot, show only a single marker
                riderLocations.push({
                    ...loc,
                    name: `${riderName} (${isHistory ? 'MET OVER HERE' : 'ARRIVED'})`,
                    status: 'confirmed' // Dark orange
                });
            }
        });
  } else if (myBooking && myBooking.pickupLocation && myBooking.pickupLocation.lat) {
      
      const rLoc = riderCurrentLoc || myBooking.pickupLocation;
      const allTripPoints = trip ? [trip.sourceCoords, ...(trip.routeWaypoints || []), trip.destinationCoords].filter(p => p && p.lat) : [];
      const meetingPoint = getPolylineIntersection(rLoc.lat, rLoc.lng, allTripPoints);

      const distToMeet = meetingPoint ? Math.sqrt((rLoc.lat - meetingPoint.lat)**2 + (rLoc.lng - meetingPoint.lng)**2) : 999;
      const isAtMeetingPoint = distToMeet < 0.0005;

      if (!isAtMeetingPoint) {
          riderLocations = [{
              ...rLoc,
              name: "📍 You Are Here",
              status: 'pending',
              isPickupNode: true
          }];

          if (meetingPoint) {
              riderLocations.push({
                  ...meetingPoint,
                  name: "WALK HERE TO MEET DRIVER",
                  status: 'confirmed', // green styling
                  isMeetupNode: true
              });
          }
      }
  }

  // Handle distinct Historical map projection logic
  let renderWaypoints = waypoints;
  let renderRouteWaypoints = trip?.routeWaypoints || [];
  let renderRiderLocations = riderLocations;
  let renderRiderMeetupPath = riderMeetupPath;
  let renderRiderPaths = [];
  let renderDriverLocation = driverLocation;

  if (isHistory) {
      // Ensure the live Driver Car Icon is entirely suppressed from historical or cancelled map records
      renderDriverLocation = null;

      if (isDriver) {
          // Driver historical view
          renderRiderPaths = trip?.status === 'cancelled' ? [] : historicalRiderPaths;
      } else if (myBooking && myBooking.pickupLocation && trip?.destinationCoords) {
          // Rider historical view
          const allTripPoints = trip ? [trip.sourceCoords, ...(trip.routeWaypoints || []), trip.destinationCoords].filter(p => p && p.lat) : [];
          const meetingPoint = getPolylineIntersection(myBooking.pickupLocation.lat, myBooking.pickupLocation.lng, allTripPoints);
          
          if (meetingPoint) {
              renderWaypoints = [meetingPoint, trip.destinationCoords]; 
          } else {
              renderWaypoints = [myBooking.pickupLocation, trip.destinationCoords];
          }
          
          renderRouteWaypoints = []; 
          renderRiderLocations = [
              { ...myBooking.pickupLocation, name: "📍 You walked from here", status: 'pending' },
              { ...trip.destinationCoords, name: "Flag Drop", status: 'completed' }
          ];
          if (meetingPoint) {
              renderRiderLocations.push({
                  ...meetingPoint,
                  name: "MET DRIVER HERE",
                  status: 'confirmed',
                  isMeetupNode: true
              });
          }
          renderRiderMeetupPath = historicalRiderPaths.length > 0 ? historicalRiderPaths[0] : null;
      }
  }

  // Smart Geofence Logic: Checks if the driver is within 400 meters of the destination coordinates
  const isDriverAtDestination = () => {
      if (!driverLocation || !trip?.destinationCoords) return false;
      const R = 6371e3; // metres
      const p1 = driverLocation.lat * Math.PI / 180;
      const p2 = trip.destinationCoords.lat * Math.PI / 180;
      const dp = (trip.destinationCoords.lat - driverLocation.lat) * Math.PI / 180;
      const dl = (trip.destinationCoords.lng - driverLocation.lng) * Math.PI / 180;
      const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c) <= 400; 
  };

  return (
    <div className="h-screen w-full relative flex flex-col">
       <Image src={bg} alt="background" fill className="object-cover blur-sm -z-10" />
       <div className="w-full h-full bg-blue-950/90 flex flex-col sm:flex-row overflow-hidden">
           {/* Left Panel */}
           <div className="order-2 sm:order-1 w-full sm:w-1/3 flex flex-col border-t sm:border-t-0 sm:border-r border-gray-700 h-[45vh] sm:h-[100dvh]">
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
                  <h1 className="text-2xl font-bold text-white mb-2">Ride Dashboard {isHistory && '(Past Trip)'}</h1>
                  <p className="text-gray-400 text-sm mb-4 break-all">Trip ID: {id}</p>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-xl border border-gray-800/50">
                      <button onClick={() => setActiveTab('status')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'status' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
                      <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>Chat 💬</button>
                  </div>

                  {activeTab === 'status' && (
                    <>
                       <TripDashboardDetails 
                           trip={trip} isInProgress={isInProgress} isDriver={isDriver} driverLocation={driverLocation} getTimeSinceUpdate={getTimeSinceUpdate} handleCancelTrip={handleCancelTrip} 
                           />
                  <TripBookingRequests isDriver={isDriver} bookings={bookings} trip={trip} actionLoading={actionLoading} handleBookingAction={handleBookingAction} />
                    </>
                  )}


                  <TripLiveChat activeTab={activeTab} messages={messages} currentUser={currentUser} newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} messagesEndRef={messagesEndRef} sending={sending} />

                  {/* Passenger Message */}
                  {/* {!loading && !isDriver && currentUser && !isHistory && (
                    <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg mt-4">
                        <p className="text-blue-300 font-medium text-sm">Passenger View</p>
                        <p className="text-gray-400 text-xs mt-1">Track this ride in real-time. Only drivers can start/end it.</p>
                    </div>
                  )} */}
              </div>

              {/* Action Buttons area */}
              <div className="p-6 border-t border-gray-800 bg-blue-950/50 backdrop-blur-sm z-10 block">
                  {!loading && !isCompleted && isDriver && !isHistory && (
                      <>
                        {isScheduled && <button onClick={() => handleStatusUpdate('in-progress')} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 transform transition active:scale-95 flex items-center justify-center gap-2">START RIDE</button>}
                        {isInProgress && (
                           isDriverAtDestination() ? (
                               <button onClick={() => handleStatusUpdate('completed')} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-600/20 transform transition active:scale-95 flex flex-col items-center justify-center">
                                   <span>END RIDE</span>
                                   <span className="text-[10px] font-normal opacity-80">(Arrived at Destination)</span>
                               </button>
                           ) : (
                               <button onClick={handleCancelTrip} className="w-full py-4 bg-red-900/80 hover:bg-red-800 border border-red-600 text-red-50 font-bold text-lg rounded-xl shadow-lg shadow-red-900/20 transform transition active:scale-95 flex flex-col items-center justify-center">
                                   <span>CANCEL TRIP</span>
                                   <span className="text-[10px] font-normal opacity-90">(Must be at Destination to End Ride)</span>
                               </button>
                           )
                        )}
                      </>
                  )}
              </div>
           </div>

           {/* Right Panel Map */}
           <div className="order-1 sm:order-2 w-full sm:w-2/3 relative bg-gray-900 h-[55vh] sm:h-[100dvh]">
               <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-[1000]">
                   <NotificationBell />
               </div>
               {deferMap ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800">
                     <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                     <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Map Engine...</p>
                   </div>
               ) : (
                   <MapWrapper waypoints={renderWaypoints} driverLocation={renderDriverLocation} riderLocations={renderRiderLocations} routeWaypoints={renderRouteWaypoints} riderMeetupPath={renderRiderMeetupPath} renderRiderPaths={renderRiderPaths} hideStartMarker={isHistory && !isDriver} />
               )}
           </div>
       </div>

       {/* Stern Driver Auto-Cancellation Penalty Warning Layer */}
       {isDriver && <TripPenaltyWarning trip={trip} router={router} />}

       {/* Trust & Safety Overlay Layers */}
       {showRatingModalFor && (
            <TripRatingModal 
                trip={trip} 
                targetUser={showRatingModalFor} 
                onSuccess={(ratedId) => { 
                    setReviewedTargets(prev => [...prev, ratedId]); 
                    setShowRatingModalFor(null); 
                    // Slick post-rating transition dropping the rider back onto their primary search interface!
                    router.push('/dashboard');
                }}
                onSkip={() => {
                    const skipId = typeof showRatingModalFor === 'object' ? showRatingModalFor._id : showRatingModalFor;
                    setReviewedTargets(prev => [...prev, skipId]);
                    setShowRatingModalFor(null);
                    router.push('/dashboard');
                }} 
            />
       )}
    </div>
  );
}
