import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Trip from "@/models/Trip";
import Booking from "@/models/Booking";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "rider"; // "driver" or "rider"

    const user = await User.findById(id).select("name profilePhoto rating reviewsCount createdAt gender isDriverVerified");
    
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    let stats = {};

    if (role === "driver") {
      const allTrips = await Trip.find({ driver: id });
      const completed = allTrips.filter(t => t.status === "completed").length;
      const cancelled = allTrips.filter(t => t.status === "cancelled").length;
      const active = allTrips.filter(t => t.status === "in-progress" || t.status === "scheduled").length;
      const total = allTrips.length;
      
      const cancelPerc = total > 0 ? Math.round((cancelled / total) * 100) : 0;

      stats = {
        role: "Driver",
        completedRides: completed,
        cancelledRides: cancelled,
        activeRides: active,
        totalRides: total,
        cancelPercentage: cancelPerc,
        rating: user.rating,
        reviewsCount: user.reviewsCount
      };
    } else {
      // Role is Rider
      const allBookings = await Booking.find({ rider: id }).populate("trip", "status");
      
      let completed = 0;
      let cancelled = 0;
      
      for (const b of allBookings) {
        if (b.status === "cancelled") {
           cancelled++;
        } else if (b.status === "confirmed" && b.trip && b.trip.status === "completed") {
           completed++;
        }
      }
      const total = allBookings.length;
      const cancelPerc = total > 0 ? Math.round((cancelled / total) * 100) : 0;

      stats = {
        role: "Rider",
        completedRides: completed,
        cancelledRides: cancelled,
        totalRides: total,
        cancelPercentage: cancelPerc,
        rating: user.rating,
        reviewsCount: user.reviewsCount
      };
    }

    return NextResponse.json({ user, stats }, { status: 200 });
  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json({ msg: "Server error", error: error.message }, { status: 500 });
  }
}
