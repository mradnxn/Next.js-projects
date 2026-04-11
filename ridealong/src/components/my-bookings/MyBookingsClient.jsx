"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";

// Sub-components
import BookingCardItem from "@/components/my-bookings/BookingCardItem";

export default function MyBookingsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/bookings/my-bookings`, { method: "GET", credentials: "include" });
        if (!res.ok) { if (res.status === 401) { router.push("/login"); return; } throw new Error("Failed to fetch bookings"); }
        const data = await res.json();
        setBookings(data);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchBookings();
  }, [router]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
       const res = await fetch(`${getApiUrl()}/api/bookings/${bookingId}`, {
           method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "cancelled" })
       });
       if (res.ok) setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: "cancelled" } : b));
       else { const data = await res.json(); alert(data.msg || "Failed to cancel booking"); }
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-gray-400 text-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 ring-1 ring-white/5">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">My Booking History</h2>
          <p className="text-gray-400">Showing your last 20 bookings</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-500 mb-6">{error}</div>}

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
            <p className="text-gray-400 mb-6">You haven't booked any rides yet.</p>
            <button onClick={() => router.push("/find-ride")} className="text-orange-400 hover:text-orange-300 font-medium transition">Find ride →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCardItem key={booking._id} booking={booking} handleCancelBooking={handleCancelBooking} router={router} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
