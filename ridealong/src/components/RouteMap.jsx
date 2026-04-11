"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import { useMap, Marker, Polyline } from "react-leaflet";
import { createStartIcon, getEndIcon, getDriverIcon, createRiderIcon } from "@/utils/mapIcons";

// GLOBAL PROTOTYPE PATCH: Prevents leaflet-routing-machine's notorious "Cannot read properties of null (reading 'removeLayer')"
// crash. This silently intercepts async XHR callbacks that trigger line-clears when the map parent has already been destroyed.
if (typeof window !== "undefined" && typeof L !== "undefined" && L.Routing && L.Routing.Control) {
    const originalClearLines = L.Routing.Control.prototype._clearLines;
    if (originalClearLines) {
        L.Routing.Control.prototype._clearLines = function() {
            if (!this._map) return; // Completely nullifies the internal library crash
            originalClearLines.call(this);
        };
    }
}

const RouteMap = ({ setRouteDetails, waypoints, driverLocation, riderLocations = [], routeWaypoints = [], riderMeetupPath = null, renderRiderPaths = [], hideStartMarker, isFollowing, setIsFollowing }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const isStatic = routeWaypoints && routeWaypoints.length > 0;
  const waypointsStr = JSON.stringify(waypoints || []);

  useEffect(() => {
    if (!map || isStatic) return;
    
    const parsedWaypoints = JSON.parse(waypointsStr);

    if (parsedWaypoints && parsedWaypoints.length === 2 && parsedWaypoints[0] && parsedWaypoints[1]) {
        if (!routingControlRef.current) {
            // Debounce creation to ensure map is ready and avoid StrictMode race conditions
            const timerId = setTimeout(() => {
                // Double check map and ref existence after delay
                if (!map || routingControlRef.current) return;

                try {
                    const routingControl = L.Routing.control({
                    router: L.Routing.osrmv1({
                        serviceUrl: "https://router.project-osrm.org/route/v1",
                        profile: "driving",
                        requestParameters: {
                            alternatives: !!setRouteDetails,
                            steps: true
                        }
                    }),
                    showAlternatives: !!setRouteDetails, 
                    routeWhileDragging: false, 
                    waypoints: [
                        L.latLng(parsedWaypoints[0].lat, parsedWaypoints[0].lng),
                        L.latLng(parsedWaypoints[1].lat, parsedWaypoints[1].lng)
                    ],

                    lineOptions: {
                        styles: [{ color: "#ea580c", opacity: 0.8, weight: 6 }] 
                    },
                    altLineOptions: {
                         styles: [{ color: "#ea580c", opacity: 0.4, weight: 6 }]
                    },
                    createMarker: function() { return null; }, 
                    show: false, 
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    }).addTo(map);
            
                    // Hide the default routing list container
                    const container = routingControl.getContainer();
                    if (container) container.style.display = "none";
            
                    routingControlRef.current = routingControl;
            
                        routingControl.on("routesfound", function (e) {
                            const routes = e.routes;
                            const summary = routes[0].summary;
                            if (setRouteDetails) {
                                setRouteDetails({
                                    distance: (summary.totalDistance / 1000).toFixed(1),
                                    duration: (summary.totalTime / 60).toFixed(0), 
                                    coordinates: routes[0].coordinates.map(c => ({ lat: c.lat, lng: c.lng }))
                                });
                            }
                        });
            
                    routingControl.on("routeselected", function(e) {
                        const route = e.route;
                        const summary = route.summary;
                        if (setRouteDetails) {
                            setRouteDetails({
                                distance: (summary.totalDistance / 1000).toFixed(1),
                                duration: (summary.totalTime / 60).toFixed(0), 
                                coordinates: route.coordinates.map(c => ({ lat: c.lat, lng: c.lng }))
                            });
                        }
                    });
            
                    routingControl.on("routingerror", function(e) {
                         // Suppress errors that happen during cleanup
                        if (e.error && e.error.message && e.error.message.includes('addLayer')) return;
                        console.error("Routing error:", e.error);
                    });
                } catch (err) {
                    console.error("Failed to initialize routing control", err);
                }
            }, 100);

            // Cleanup timeout if checking again
            return () => clearTimeout(timerId);

        } else {
             // Update existing waypoints
             routingControlRef.current.setWaypoints([
                L.latLng(parsedWaypoints[0].lat, parsedWaypoints[0].lng),
                L.latLng(parsedWaypoints[1].lat, parsedWaypoints[1].lng)
            ]);
        }
    }
    
    // Cleanup on unmount
    return () => {
        const control = routingControlRef.current;
        if (control) {
             // Monkey-patch internal methods to prevent crash from pending XHRs
             // This prevents the "Cannot read properties of undefined (reading '_removePath')\" error
             // which happens when the router tries to clear lines on a destroyed map.
             try {
                if (map && map.getContainer()) {
                    map.removeControl(control);
                }
             } catch (e) {
                 console.warn("Error cleaning up routing control", e);
             }
        }
        routingControlRef.current = null;
    };
  }, [map, setRouteDetails, waypointsStr, isStatic]);

  const routeWaypointsStr = JSON.stringify(routeWaypoints || []);

  useEffect(() => {
    const parsedRouteWaypoints = JSON.parse(routeWaypointsStr);
    if (map && isStatic && parsedRouteWaypoints.length > 0) {
       const bounds = L.latLngBounds(parsedRouteWaypoints.map(w => [w.lat, w.lng]));
       map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, isStatic, routeWaypointsStr]);

  // Camera Tracking Engine
  useEffect(() => {
    if (isFollowing && driverLocation && driverLocation.lat && driverLocation.lng && map) {
      // Lock target crosshair on driver with buttery smooth animated tracking
      map.setView([driverLocation.lat, driverLocation.lng], map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [driverLocation, isFollowing, map]);

  // Manually sever tracking connection natively upon user interaction
  useEffect(() => {
    if (!map || !setIsFollowing) return;
    const haltTracking = () => setIsFollowing(false);
    map.on('dragstart', haltTracking);
    return () => map.off('dragstart', haltTracking);
  }, [map, setIsFollowing]);

  const startPoint = waypoints && waypoints[0] ? waypoints[0] : null;
  const endPoint = waypoints && waypoints[1] ? waypoints[1] : null;

  return (
    <>
      {isStatic && <Polyline positions={routeWaypoints.map(w => [w.lat, w.lng])} color="#ea580c" opacity={0.8} weight={6} />}
      {riderMeetupPath && (
         <Polyline 
            positions={riderMeetupPath} 
            color="#3b82f6" 
            dashArray="10, 10" 
            weight={4} 
            opacity={0.8} 
         />
      )}
      {renderRiderPaths && renderRiderPaths.length > 0 && renderRiderPaths.map((path, idx) => (
         <Polyline 
            key={`rider-path-${idx}`}
            positions={path} 
            color="#3b82f6" 
            dashArray="10, 10" 
            weight={4} 
            opacity={0.8} 
         />
      ))}
      {startPoint && !hideStartMarker && (
        <Marker 
          position={[startPoint.lat, startPoint.lng]} 
          icon={createStartIcon()} 
          interactive={false}
        />
      )}
      {endPoint && (
        <Marker 
          position={[endPoint.lat, endPoint.lng]} 
          icon={getEndIcon()} 
          interactive={false}
        />
      )}
      {driverLocation && driverLocation.lat && driverLocation.lng && (
        <Marker 
          position={[driverLocation.lat, driverLocation.lng]} 
          icon={getDriverIcon()} 
          interactive={false}
          zIndexOffset={1000}
        />
      )}
      {riderLocations && riderLocations.map((riderLoc, idx) => (
        riderLoc.lat && riderLoc.lng && (
          <Marker 
            key={`rider-${idx}`}
            position={[riderLoc.lat, riderLoc.lng]} 
            icon={createRiderIcon(riderLoc)} 
            interactive={true}
          />
        )
      ))}
    </>
  );
};
export default RouteMap;
