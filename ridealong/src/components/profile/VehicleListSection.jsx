import React from 'react';

export default function VehicleListSection({
    user,
    setShowAddVehicle,
    handleSetDefaultVehicle,
    handleDeleteVehicle,
    handleReVerifyVehicle
}) {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50 ring-1 ring-white/5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-400">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875H5.25a3.375 3.375 0 006.75 0h2.625a1.875 1.875 0 001.875-1.875V15z" />
                <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3.375 3.375 0 005.958.464.75.75 0 00-.42-1.006 1.875 1.875 0 01-1.08-2.456V7.5a.75.75 0 00-.75-.75h-3zM19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
              </svg>
              My Vehicles
            </h3>
            <button onClick={() => setShowAddVehicle(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Add Vehicle
            </button>
          </div>

          {!user?.vehicles || user.vehicles.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
              <p className="text-gray-400 font-medium">No vehicles added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.vehicles.map((vehicle) => (
                <div key={vehicle._id} className={`flex items-start justify-between p-4 rounded-xl border transition ${
                    vehicle.status === "verified" ? (vehicle.isDefault ? "bg-orange-900/20 border-orange-700/50" : "bg-green-900/10 border-green-800/40")
                    : vehicle.status === "rejected" ? "bg-red-900/10 border-red-800/40"
                    : "bg-slate-800/50 border-slate-700/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      vehicle.status === "verified" ? (vehicle.isDefault ? "bg-orange-500/20" : "bg-green-500/20")
                      : vehicle.status === "rejected" ? "bg-red-500/20" : "bg-slate-700"
                    }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${
                          vehicle.status === "verified" ? (vehicle.isDefault ? "text-orange-400" : "text-green-400") : "text-gray-400"
                        }`}><path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25z" /></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold">{vehicle.make} {vehicle.model}</p>
                        {vehicle.isDefault && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">Default</span>}
                        {vehicle.status === "verified" && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">✅ Verified</span>}
                        {vehicle.status === "rejected" && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">❌ Rejected</span>}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{vehicle.plateNumber} | {vehicle.color}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {!vehicle.isDefault && (
                      <button onClick={() => handleSetDefaultVehicle(vehicle._id)} className="text-xs text-orange-400 hover:text-orange-300 border border-orange-700/50 px-3 py-1.5 rounded-lg transition">Set Default</button>
                    )}
                    <button onClick={() => handleDeleteVehicle(vehicle._id)} className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5z" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    );
}
