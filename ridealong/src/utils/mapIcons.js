import L from "leaflet";

export const createStartIcon = () => {
  return L.divIcon({
      className: 'custom-start-icon',
      html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; pointer-events: none;">
          <div style="position: absolute; width: 24px; height: 24px; background-color: rgba(59, 130, 246, 0.5); border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; background-color: #2563eb; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5); z-index: 10;"></div>
      </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
  });
};

export const getEndIcon = () => {
    return L.divIcon({
      className: 'custom-end-icon',
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
};

export const getDriverIcon = () => {
    return L.divIcon({
      className: 'custom-driver-icon',
      html: `
        <div style="position: relative; width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; pointer-events: none;">
          <div style="position: absolute; width: 40px; height: 40px; background-color: rgba(34, 197, 94, 0.3); border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
          <div style="position: relative; z-index: 10; background-color: #22c55e; border: 3px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
};

export const createRiderIcon = (rider) => {
    const isPending = rider.status === 'pending';
    const nameStr = rider.name || 'Rider'; 
    return L.divIcon({
        className: 'custom-rider-icon',
        html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="position: absolute; top: -20px; background-color: ${isPending ? '#d97706' : '#ea580c'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.4); z-index: 20;">
               ${nameStr}
            </div>
            <div style="position: relative; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center;">
                <div style="position: absolute; width: 28px; height: 28px; background-color: ${isPending ? 'rgba(217, 119, 6, 0.4)' : 'rgba(234, 88, 12, 0.4)'}; border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
                <div style="position: relative; width: 14px; height: 14px; background-color: ${isPending ? '#d97706' : '#ea580c'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5); z-index: 10;"></div>
            </div>
        </div>
        `,
        iconSize: [32, 56], 
        iconAnchor: [16, 32] 
    });
};
