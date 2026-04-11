import Image from "next/image";
import bg from "@/../public/Ride_along_bg.png";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

// Client Sub-component
import FindRideClient from "@/components/find-ride/FindRideClient";

export const metadata = {
  title: "Find a Ride | RideAlong",
  description: "Search and discover available carpool options towards your destination. Connect with drivers safely and affordably.",
};

export default function FindRidePage() {
  return (
    <div className="min-h-screen relative pt-24 pb-12 px-6 overflow-x-hidden bg-[#020617] flex justify-center">
      <Image src={bg} alt="background" fill className="object-cover opacity-20 blur-md -z-10" />

      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 fixed top-0 left-0 w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition group w-20 sm:w-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white invisible md:visible">Search Network</h1>
          <div className="w-20 sm:w-40 flex justify-end">
             <NotificationBell />
          </div>
        </div>
      </div>
      
      {/* Static Server Content */}
      <div className="w-full max-w-6xl relative z-10 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Find Your Ride</h1>
          <p className="text-slate-400 font-medium tracking-wide text-[10px]">EXPLORE AVAILABLE JOURNEYS IN YOUR NETWORK</p>
        </div>

        {/* Main Client Content */}
        <FindRideClient />
      </div>
    </div>
  );
}
