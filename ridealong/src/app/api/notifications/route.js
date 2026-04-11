import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import Booking from "@/models/Booking"; // For populating relatedBooking
import User from "@/models/User";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const { authenticated, userId } = await requireAuth();
    
    // Allow unauthorized users to fail silently on notifications usually
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name profilePhoto gender")
      .populate("relatedBooking", "seatsBooked status")
      .sort({ createdAt: -1 })
      .limit(50); // Keep reasonable limit

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
