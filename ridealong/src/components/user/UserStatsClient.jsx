"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/api";

export default function UserStatsClient({ userId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role") || "rider";
  const [role, setRole] = useState(rawRole); // Allows toggling stats inline
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/users/${userId}/stats?role=${role}`);
        if (!res.ok) throw new Error("Could not fetch user profile");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchStats();
  }, [userId, role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 text-gray-400">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="tracking-widest uppercase text-xs animate-pulse font-bold">Loading Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto pt-32 text-center text-red-400 relative z-10">
        <div className="bg-red-900/20 border border-red-500/20 p-8 rounded-2xl">
           <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
           <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const { user, stats } = data;
  const isDriverProfile = role === "driver";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 w-full">
      {/* Tab Toggler (Because they can be both driver and rider) */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/50 p-1 border border-slate-700/50 rounded-xl inline-flex shadow-xl backdrop-blur-md">
          <button 
             onClick={() => setRole("driver")} 
             className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition ${isDriverProfile ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
             Driver Stats
          </button>
          <button 
             onClick={() => setRole("rider")} 
             className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition ${!isDriverProfile ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
             Rider Stats
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 items-center md:items-start">
        {/* Left Side: Avatar & Identity */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full relative mb-4 border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
             {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                <span className="text-5xl font-black text-orange-500">{user.name.charAt(0)}</span>
             )}
             
             {user.isDriverVerified && isDriverProfile && (
                <div className="absolute bottom-2 right-2 flex items-center justify-center bg-green-500 rounded-full w-8 h-8 border-2 border-slate-900 shadow-xl" title="Verified Driver">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                </div>
             )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-1">{user.name}</h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1 rounded-full border border-slate-700">
             {stats.role}
          </p>
          
          <div className="mt-6 flex flex-col items-center">
             <div className="flex items-center gap-1">
                <span className="text-4xl font-black text-yellow-400">{user.rating > 0 ? user.rating.toFixed(1) : "—"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500 mb-1"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
             </div>
             <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">
                {user.reviewsCount} {user.reviewsCount === 1 ? 'Review' : 'Reviews'}
             </p>
          </div>
        </div>

        {/* Right Side: Analytical Metrics */}
        <div className="flex-1 w-full flex flex-col justify-center">
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm group-hover:blur-md transition group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-500"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 relative z-10">Completed</p>
                   <p className="text-4xl font-black text-white relative z-10">{stats.completedRides || 0}</p>
                </div>
                
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm group-hover:blur-md transition group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-blue-500"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 17.25c-4.142 0-7.5-3.358-7.5-7.5s3.358-7.5 7.5-7.5 7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5zM12 7.125a.75.75 0 00-.75.75v5.03l3.66 2.196a.75.75 0 10.78-1.292L12.75 12.08V7.875a.75.75 0 00-.75-.75z" clipRule="evenodd" /></svg>
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 relative z-10">Total History</p>
                   <p className="text-4xl font-black text-white relative z-10">{stats.totalRides || 0}</p>
                </div>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Cancellation Rate</p>
                        <p className="text-3xl font-black text-red-400">{stats.cancelPercentage}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium">{stats.cancelledRides} Cancellations</p>
                    </div>
                </div>
                
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div 
                        className={`h-full rounded-full ${stats.cancelPercentage > 20 ? 'bg-red-500' : stats.cancelPercentage > 5 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min(100, stats.cancelPercentage)}%` }}
                    ></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-start gap-3">
                     <div className="mt-1 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
                     </div>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        {stats.cancelPercentage > 20 
                            ? "High cancellation rates indicate severe unreliability. Exercise extreme caution." 
                            : stats.cancelPercentage > 5 
                                ? "Moderate cancellation rate. They occasionally drop out of rides."
                                : "Excellent reliability track record! They rarely drop rides."}
                     </p>
                </div>
            </div>
            
            <p className="text-[10px] uppercase tracking-widest text-slate-500 text-center mt-6 font-bold">
               User since {new Date(user.createdAt).getFullYear()}
            </p>

        </div>
      </div>
    </div>
  );
}
