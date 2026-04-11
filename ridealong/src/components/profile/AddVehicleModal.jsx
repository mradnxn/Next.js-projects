import React from 'react';

export default function AddVehicleModal({
    showAddVehicle,
    setShowAddVehicle,
    newVehicle,
    setNewVehicle,
    registrationFile,
    setRegistrationFile,
    registrationPreview,
    setRegistrationPreview,
    vehicleSaving,
    handleAddVehicle
}) {
    if (!showAddVehicle) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => { setShowAddVehicle(false); setRegistrationFile(null); setRegistrationPreview(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">Add Vehicle</h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Make (e.g. Toyota)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="text" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Model (e.g. Innova)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} placeholder="Year" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="text" value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} placeholder="Color" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input type="text" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value.toUpperCase() })} placeholder="Plate Number" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono" />
              <input type="number" value={newVehicle.seats} onChange={(e) => setNewVehicle({ ...newVehicle, seats: e.target.value })} placeholder="Seats" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />

              <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition ${registrationFile ? "border-orange-500/50 bg-orange-900/10" : "border-slate-600 bg-slate-800/50"}`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { setRegistrationFile(file); setRegistrationPreview(URL.createObjectURL(file)); } }} />
                {registrationPreview ? <img src={registrationPreview} className="w-full max-h-40 object-contain p-2" /> : <p className="text-gray-400 text-sm py-6">Upload RC Photo</p>}
              </label>

              <button onClick={handleAddVehicle} disabled={vehicleSaving} className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                {vehicleSaving ? "Verifying with AI..." : "Add & Verify Vehicle"}
              </button>
            </div>
          </div>
        </div>
    );
}
