"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardTopBar from "./DashboardTopBar";

export default function DashboardClient({ initialUser, staticHeading, howItWorks }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [mode, setMode] = useState(initialUser?.isDriverVerified ? "driver" : "rider");

  return (
    <>
      <DashboardTopBar user={user} mode={mode} setMode={setMode} />
      
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 pt-24">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 ring-1 ring-white/5">
          
          {/* Static Heading passed as a prop from layout */}
          {staticHeading}


          {/* Mode Specific Actions */}
          <div className="mt-4">
            {mode === "driver" ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Driver Actions</h2>
                {user?.isDriverVerified ? (
                  <>
                    <button onClick={() => router.push("/create-trip")} className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>Create New Trip</button>
                    <button onClick={() => router.push("/my-trips")} className="w-full py-4 bg-blue-900/50 border-2 border-blue-700 text-blue-200 rounded-xl text-lg font-semibold hover:bg-blue-900 transition">View My Trips</button>
                  </>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500 flex-shrink-0"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                      <div className="flex-1"><h3 className="text-yellow-400 font-semibold text-lg mb-2">Driver Verification Required</h3><p className="text-gray-300 mb-4">You need to verify your driver credentials before creating trips.</p>
                        <button onClick={() => router.push("/driver/profile")} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition">Get Verified Now</button>
                      </div></div></div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Rider Actions</h2>
                <button onClick={() => router.push("/find-ride")} className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" /></svg>Find a Ride</button>
                <button onClick={() => router.push("/my-bookings")} className="w-full py-4 bg-blue-900/50 border-2 border-blue-700 text-blue-200 rounded-xl text-lg font-semibold hover:bg-blue-900 transition">My Bookings</button>
              </div>
            )}
          </div>

          {/* Static How It Works section passed as prop */}
          {howItWorks}
        </div>
      </div>
    </>
  );
}
