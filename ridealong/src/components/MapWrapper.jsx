"use client";

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import RouteMap from "./RouteMap";

const MAP_STYLES = {
  osm: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    name: "Dark Mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  light: {
    name: "Light Mode",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};


export default function MapWrapper({ setRouteDetails, waypoints, driverLocation, riderLocations, routeWaypoints, riderMeetupPath, renderRiderPaths, hideStartMarker }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(() => {
    // Try to load saved preference, default to 'osm'
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem("mapStyle");
        return saved || "osm";
    }
    return "osm";
  });

  const handleStyleChange = (e) => {
      const newStyle = e.target.value;
      setCurrentStyle(newStyle);
      localStorage.setItem("mapStyle", newStyle);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
        {/* Style Switcher Overlay */}
        <div className="absolute top-4 right-20 md:top-5 md:right-[5.5rem] z-[1000] bg-blue-950/90 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl px-3 py-2 flex items-center gap-2 transition hover:bg-blue-900/90">
             <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Map Style</span>
             <div className="h-4 w-[1px] bg-gray-600"></div>
             <select 
                value={currentStyle}
                onChange={handleStyleChange}
                className="text-sm text-gray-100 font-medium bg-transparent outline-none cursor-pointer hover:text-white"
                style={{ colorScheme: 'dark' }} 
            >
                <option value="osm" className="bg-blue-950 text-white">Standard</option>
                <option value="dark" className="bg-blue-950 text-white">Dark Mode</option>
                <option value="light" className="bg-blue-950 text-white">Light Mode</option>
                <option value="satellite" className="bg-blue-950 text-white">Satellite</option>
            </select>
        </div>

        {/* Follow-Camera Tracking Button */}
        {driverLocation && driverLocation.lat && (
             <button 
                onClick={() => setIsFollowing(!isFollowing)}
                title="Follow Driver Live"
                className={`absolute bottom-8 right-4 md:bottom-10 md:right-6 z-[1000] p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition transform hover:scale-110 border ${isFollowing ? 'bg-orange-500 border-orange-400 text-white shadow-orange-500/50' : 'bg-slate-900/95 border-slate-600 text-orange-400 hover:bg-slate-800'}`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 stroke-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3" fill={isFollowing ? "currentColor" : "none"}></circle>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4" y1="12" x2="8" y2="12"></line>
                  <line x1="16" y1="12" x2="20" y2="12"></line>
                </svg>
             </button>
        )}

        <MapContainer
        center={[20.5937, 78.9629]} // Default to India center
        zoom={5}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        className="z-10"
        >
        <TileLayer
            attribution={MAP_STYLES[currentStyle].attribution}
            url={MAP_STYLES[currentStyle].url}
        />

        <RouteMap setRouteDetails={setRouteDetails} waypoints={waypoints} driverLocation={driverLocation} riderLocations={riderLocations} routeWaypoints={routeWaypoints} riderMeetupPath={riderMeetupPath} renderRiderPaths={renderRiderPaths} hideStartMarker={hideStartMarker} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
        </MapContainer>
    </div>
  );
}