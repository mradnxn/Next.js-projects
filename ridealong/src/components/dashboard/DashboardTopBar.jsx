"use client";

import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";
import NotificationBell from "../NotificationBell";
import { logoutAction } from "@/actions/authActions";
import { useTransition, useState } from "react";

export default function DashboardTopBar({ user, mode, setMode }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
        logoutAction();
    });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 fixed top-0 w-full z-50 shadow-lg left-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left: Profile Dropdown */}
          <div className="relative z-50">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 hover:bg-blue-900/50 px-3 py-2 rounded-lg transition">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-lg" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-white font-semibold text-sm">{user?.name}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <button onClick={() => { router.push("/profile"); setShowDropdown(false); }} className="w-full px-4 py-3 text-left text-white hover:bg-slate-800 transition flex items-center gap-3 border-b border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg>
                  <div><p className="font-medium">My Profile</p><p className="text-gray-400 text-xs">View and edit profile</p></div>
                </button>
                <div className="px-4 py-3 border-b border-slate-700"><p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Switch Mode</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setMode("rider"); setShowDropdown(false); }} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${mode === "rider" ? "bg-orange-500 text-white" : "bg-slate-800/50 text-gray-300 hover:bg-slate-800"}`} >🚗 Rider</button>
                    <button onClick={() => { setMode("driver"); setShowDropdown(false); }} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${mode === "driver" ? "bg-orange-500 text-white" : "bg-slate-800/50 text-gray-300 hover:bg-slate-800"}`} >🚙 Driver</button>
                  </div>
                </div>
                {user?.isDriverVerified && (<div className="px-4 py-3 bg-green-900/20 border-b border-slate-700"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><p className="text-green-400 text-sm font-medium">Verified Driver</p></div></div>)}
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" /><path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" /></svg>Logout</button>
              </div>
            )}
          </div>

          {/* Right: Current Mode Badge & Notifications */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-800/50">
               <span className="text-gray-400 text-sm hidden sm:inline">Mode:</span>
               <span className="text-orange-400 font-semibold capitalize">{mode}</span>
             </div>
             <NotificationBell />
          </div>
        </div>
      </div>

      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
    </>
  );
}
