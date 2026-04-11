import Link from "next/link";
import MyBookingsClient from "@/components/my-bookings/MyBookingsClient";
import NotificationBell from "@/components/NotificationBell";

export const metadata = {
  title: "My Seat Bookings | RideAlong",
  description: "View and manage your current booked rides, cancels, and pickup points layouts with RideAlong.",
};

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Top Nav */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
            Back
          </Link>
          <h1 className="text-xl font-bold text-white">My Bookings</h1>
          <div className="w-20 flex justify-end">
              <NotificationBell />
          </div>
        </div>
      </div>

      {/* Main Client Content */}
      <MyBookingsClient />
    </div>
  );
}
