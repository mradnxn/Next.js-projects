import React from 'react';
import Image from "next/image";
import bg from "@/../public/Ride_along_bg.png";

export default function Loading() {
  return (
    <div className="h-screen w-full relative flex flex-col">
       <Image src={bg} alt="background" fill className="object-cover blur-sm -z-10" />
       
       <div className="w-full h-full bg-blue-950/90 flex flex-col md:flex-row overflow-hidden animate-pulse">
           
           {/* Left Panel Skeleton */}
           <div className="order-2 md:order-1 w-full md:w-1/3 flex flex-col border-t md:border-t-0 md:border-r border-gray-700 h-[45vh] md:h-full">
              <div className="flex-1 p-6 flex flex-col">
                  {/* Title Skeleton */}
                  <div className="h-8 bg-slate-800 rounded-lg w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-1/3 mb-6"></div>

                  {/* Tab Navigation Skeleton */}
                  <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-xl border border-gray-800/50">
                      <div className="h-8 bg-slate-800 rounded-lg w-1/2"></div>
                      <div className="h-8 bg-slate-800 rounded-lg w-1/2"></div>
                  </div>

                  {/* Dashboard Details Skeleton */}
                  <div className="flex-1 space-y-6">
                      <div className="h-20 bg-slate-800/50 rounded-xl border border-slate-800"></div>
                      <div className="h-32 bg-slate-800/50 rounded-xl border border-slate-800"></div>
                      <div className="h-16 bg-slate-800/50 rounded-xl border border-slate-800"></div>
                  </div>
              </div>

              {/* Action Button Area Skeleton */}
              <div className="p-6 border-t border-gray-800 bg-blue-950/50 block">
                  <div className="h-14 bg-slate-800 rounded-xl w-full"></div>
              </div>
           </div>

           {/* Right Panel Map Skeleton */}
           <div className="order-1 md:order-2 w-full md:w-2/3 relative bg-gray-900 h-[55vh] md:h-full flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Connecting to Server...</p>
           </div>
       </div>
    </div>
  );
}
