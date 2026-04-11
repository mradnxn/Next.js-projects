import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all bookings for a specific trip (Driver only)
export async function GET(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id: tripId } = await params;

    // Verify trip exists and user is the driver
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ msg: "Trip not found" }, { status: 404 });
    }

    // Convert ObjectIds to strings for safe comparison
    const driverIdStr = trip.driver.toString();
    
    // We allow anyone to fetch bookings to see available seats, but maybe we only want drivers 
    // for this specific detailed view. The plan says "for the driver to fetch all bookings associated with their trip."
    if (driverIdStr !== userId) {
        return NextResponse.json({ msg: "Only the driver can view trip bookings" }, { status: 403 });
    }

    // Fetch bookings, populate rider details (name, gender, profile photo)
    const bookings = await Booking.find({ trip: tripId })
      .populate("rider", "name gender profilePhoto")
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Fetch trip bookings error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
