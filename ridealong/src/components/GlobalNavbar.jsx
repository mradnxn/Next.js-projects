"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";
import NotificationBell from "./NotificationBell";
import { logoutAction } from "@/actions/authActions";
import { useTransition } from "react";

export default function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef(null);

  const hiddenPaths = ["/", "/login", "/signup"];
  
  useEffect(() => {
    if (hiddenPaths.includes(pathname)) return;
    
    const fetchUser = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) { console.error("Error fetching user for navbar", err); }
    };
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    startTransition(() => {
        logoutAction();
    });
  };

  // Completely hide navigation structure on public/auth pages
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl transition-all">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link href="/dashboard" className="text-white font-black text-2xl tracking-tighter hover:scale-105 transition-transform origin-left">
          Ride<span className="text-orange-500">Along</span>
        </Link>
        
        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/dashboard" className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/my-bookings" className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors">Bookings</Link>
          
          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-800 mx-2"></div>
          
          <NotificationBell />
          
          <div className="relative z-[100]" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="flex items-center gap-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 p-1 pr-3 lg:pr-4 rounded-full transition-all focus:ring-2 ring-orange-500/50 shadow-xl"
            >
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-lg border border-slate-700" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-white font-bold text-xs truncate max-w-[120px]">{user?.name || 'Loading...'}</p>
                {user?.isDriverVerified && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                     <p className="text-slate-400 text-[9px] uppercase font-semibold tracking-wider">Driver Verified</p>
                  </div>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 transition-transform hidden sm:block ${showDropdown ? 'rotate-180 text-orange-400' : ''}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                 {/* Mobile user details info fallback */}
                 <div className="lg:hidden px-4 py-3 border-b border-slate-800 mb-2 bg-slate-950/50">
                    <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-gray-400 text-[10px] uppercase mt-1 tracking-wider">{user?.email}</p>
                 </div>
                
                 <button onClick={() => { router.push("/profile"); setShowDropdown(false); }} className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                  My Profile
                </button>
                <div className="h-px bg-slate-800 my-1 mx-3"></div>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 transition flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" /></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
