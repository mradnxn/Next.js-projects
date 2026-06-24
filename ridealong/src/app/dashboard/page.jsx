import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

// Client Sub-component
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard | RideAlong",
  description: "Welcome to your RideAlong Dashboard. Manage your rider requests, create driver trips, and track travel history seamlessly.",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user = null;
  try {
    await connectDB();
    const userId = verifyToken(cookieStore);
    if (!userId) redirect("/login");

    const userDoc = await User.findById(userId).lean();
    if (!userDoc) redirect("/login");

    // Sanitize user doc for Client Component
    user = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      gender: userDoc.gender,
      isDriverVerified: userDoc.isDriverVerified,
      profilePhoto: userDoc.profilePhoto
    };
  } catch (error) {
    console.error("Dashboard DB Query Error:", error);
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl"></div>

      {/* Server Rendered Dashboard Content wrapped by DashboardClient */}
      <DashboardClient 
        initialUser={user}
        staticHeading={
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-300">Complete your rider or driver actions below.</p>
          </div>
        }
        howItWorks={
          <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-5 mt-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              How It Works
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">1.</span><span>Search for rides going to your destination or create your own</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">2.</span><span>View driver details and trip information</span></li>
              <li className="flex items-start gap-2"><span className="text-orange-400 font-bold">3.</span><span>Book your seat and track the ride in real-time</span></li>
            </ul>
          </div>
        }
      />
    </div>
  );
}
