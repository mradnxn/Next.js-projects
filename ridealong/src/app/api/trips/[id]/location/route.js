import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";

// PATCH - Update driver location for real-time tracking (protected)
export async function PATCH(request, { params }) {
  try {
    // Check authentication
    const { authenticated, userId } = await requireAuth();
    
    if (!authenticated) {
      return NextResponse.json(
        { msg: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { msg: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json(
        { msg: "Trip not found" },
        { status: 404 }
      );
    }

    // Verify that the requester is the driver
    if (trip.driver.toString() !== userId) {
      return NextResponse.json(
        { msg: "Only the driver can update location" },
        { status: 403 }
      );
    }

    trip.currentLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      timestamp: new Date()
    };
    trip.lastLocationUpdate = new Date();

    await trip.save();

    return NextResponse.json({ 
      msg: "Location updated successfully",
      currentLocation: trip.currentLocation,
      lastLocationUpdate: trip.lastLocationUpdate
    }, { status: 200 });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json(
      { msg: "Error updating location", error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get driver location for passengers
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const trip = await Trip.findById(id).select('currentLocation lastLocationUpdate status');
    
    if (!trip) {
      return NextResponse.json(
        { msg: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      currentLocation: trip.currentLocation,
      lastLocationUpdate: trip.lastLocationUpdate,
      status: trip.status
    }, { status: 200 });
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json(
      { msg: "Error fetching location", error: error.message },
      { status: 500 }
    );
  }
}
