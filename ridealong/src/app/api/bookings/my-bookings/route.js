import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";

// GET - Fetch last 20 bookings for the authenticated rider
export async function GET() {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const bookings = await Booking.find({ rider: userId })
      .populate({
        path: "trip",
        populate: { path: "driver", select: "name profilePhoto" }
      })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Fetch my-bookings error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
