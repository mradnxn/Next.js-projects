import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";

// PATCH - Update passenger location for real-time tracking (protected)
export async function PATCH(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id: tripId } = await params;
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json({ msg: "Latitude and longitude are required" }, { status: 400 });
    }

    // Verify trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ msg: "Trip not found" }, { status: 404 });
    }

    // Find the current user's booking for this particular trip
    const booking = await Booking.findOne({ trip: tripId, rider: userId });
    
    if (!booking) {
      return NextResponse.json({ msg: "Not a passenger on this trip" }, { status: 403 });
    }

    // Update their current active location
    booking.currentLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      timestamp: new Date()
    };

    await booking.save();

    return NextResponse.json({ 
      msg: "Rider location updated successfully",
      currentLocation: booking.currentLocation
    }, { status: 200 });

  } catch (error) {
    console.error("Update rider location error:", error);
    return NextResponse.json({ msg: "Server error updating location" }, { status: 500 });
  }
}
