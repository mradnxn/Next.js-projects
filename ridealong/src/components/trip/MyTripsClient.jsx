"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";

export default function MyTripsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/trips/driver`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await res.json();
        setTrips(data);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-gray-500 text-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 ring-1 ring-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">My Trip History</h2>
            <p className="text-gray-400">Showing your last 20 trips</p>
          </div>
          <button
             onClick={() => router.push("/create-trip")}
             className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-orange-500/20"
          >
            + New Trip
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-500 mb-6">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-500">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No trips found</h3>
            <p className="text-gray-400 mb-6">You haven't created any trips yet.</p>
            <button onClick={() => router.push("/create-trip")} className="text-orange-400 hover:text-orange-300 font-medium transition">
              Create your first trip →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/80 transition group overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        trip.status === "scheduled" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        trip.status === "in-progress" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        trip.status === "completed" ? "bg-gray-500/10 text-gray-400 border border-gray-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {trip.status}
                      </span>
                      <span className="text-gray-500 text-sm">{new Date(trip.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20"></div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-orange-500 to-blue-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div><p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Source</p><p className="text-white font-medium">{trip.source}</p></div>
                        <div><p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Destination</p><p className="text-white font-medium">{trip.destination}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-6 border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                    <div><p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Vehicle</p><p className="text-white font-semibold">{trip.vehicleType}</p></div>
                    <div><p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Seats</p><p className="text-orange-400 font-bold text-xl">{trip.seats}</p></div>
                    <button onClick={() => router.push(`/trip/${trip._id}?history=true`)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
