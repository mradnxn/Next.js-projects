import React from 'react';

export default function TripStep1Details({
    form,
    handleChange,
    userVehicles,
    handleNext,
    router
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Vehicle Selection Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                    Primary Asset
                  </label>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Select Your Vehicle
                  </h2>
                </div>
                <button 
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-all"
                >
                  <span className="text-[9px] font-bold text-gray-400 group-hover:text-orange-400 uppercase tracking-wider">+ Register</span>
                </button>
              </div>

              <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar snap-x snap-mandatory">
                  {userVehicles.length === 0 ? (
                    <div className="w-full py-12 border border-slate-800/50 rounded-3xl bg-slate-900/40 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Fleet Empty</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest">Verify a vehicle in your profile</p>
                    </div>
                  ) : (
                    userVehicles.map(v => (
                      <div 
                        key={v._id}
                        onClick={() => handleChange({ target: { name: 'vehicleId', value: v._id } })}
                        className={`min-w-[200px] snap-center relative p-5 rounded-3xl border transition-all cursor-pointer group/card ${
                          form.vehicleId === v._id 
                            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-orange-500/50 shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/20" 
                            : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        <div className={`absolute top-4 right-4 transition-colors ${form.vehicleId === v._id ? "text-orange-500/20" : "text-slate-800"}`}>
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                          <div className="space-y-1">
                            <h3 className={`text-base font-black tracking-tight transition-colors ${form.vehicleId === v._id ? "text-white" : "text-gray-400"}`}>
                              {v.make}
                            </h3>
                            <p className={`text-xs font-bold ${form.vehicleId === v._id ? "text-orange-400" : "text-gray-500"}`}>{v.model}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">License Plate</p>
                              <p className="text-[10px] font-mono font-bold text-gray-300">{v.plateNumber}</p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              form.vehicleId === v._id ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20" : "bg-slate-800 text-gray-500 border-slate-700"
                            }`}>
                              {v.seats || v.seatingCapacity}
                            </div>
                          </div>
                        </div>
                        
                        {form.vehicleId === v._id && (
                           <div className="absolute -top-1.5 -right-1.5 bg-orange-500 p-1.5 rounded-full shadow-2xl ring-4 ring-slate-950 animate-in zoom-in-50 duration-300">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
                           </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">Seating Allocation</label>
                  <div className="relative">
                    <select
                      name="seats"
                      value={form.seats}
                      onChange={handleChange}
                      className={`w-full bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer transition-all ${
                         !form.vehicleId ? "opacity-40 border-slate-800/50 cursor-not-allowed grayscale" : "border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/50"
                      }`}
                      required
                      disabled={!form.vehicleId}
                    >
                      <option value="" disabled className="bg-slate-950">Seating</option>
                      {(() => {
                        if (!form.vehicleId) return null;
                        const vehicle = userVehicles.find(v => v._id === form.vehicleId);
                        if (!vehicle) return null;
                        const capacityValue = vehicle.seats ?? vehicle.seatingCapacity ?? 0;
                        const maxSeats = Math.max(0, Number(capacityValue) - 1);
                        const options = [];
                        for (let i = 1; i <= maxSeats; i++) {
                          options.push(<option key={i} value={i} className="bg-slate-950">{i} {i === 1 ? 'Seat' : 'Seats'}</option>);
                        }
                        return options;
                      })()}
                    </select>
                  </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">Mileage Estimate</label>
                <div className="relative">
                  <input
                    type="number" name="mileage" placeholder="km/l" onChange={handleChange} value={form.mileage}
                    className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-slate-700 hover:bg-slate-800/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Scheduled Date</label>
              <input
                type="datetime-local" name="date" onChange={handleChange} value={form.date}
                className="w-full bg-slate-900/50 border border-slate-800/50 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="button" onClick={handleNext}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] hover:shadow-orange-500/30 transition-all"
              >
                Confirm Details
              </button>
            </div>
        </div>
    );
}
