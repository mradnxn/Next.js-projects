import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET - Fetch user's bookings
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
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

// POST - Create a new booking
export async function POST(request) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { tripId, seatsBooked, pickupLocation } = await request.json();

    if (!tripId || !seatsBooked) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ msg: "Trip not found" }, { status: 404 });
    }

    if (trip.seats < seatsBooked) {
      return NextResponse.json({ msg: "Not enough seats available" }, { status: 400 });
    }

    // Check if user already booked this trip
    const existingBooking = await Booking.findOne({ rider: userId, trip: tripId });
    if (existingBooking) {
      return NextResponse.json({ msg: "You have already booked this trip" }, { status: 400 });
    }

    // Create booking (Starts as pending)
    const booking = new Booking({
      rider: userId,
      trip: tripId,
      seatsBooked,
      pickupLocation,
      status: "pending"
    });

    // Enforce 20-booking limit per rider
    const bookingCount = await Booking.countDocuments({ rider: userId });
    if (bookingCount >= 20) {
      const oldestBookings = await Booking.find({ rider: userId })
        .sort({ createdAt: 1 })
        .limit(bookingCount - 19);
      
      const bookingIdsToDelete = oldestBookings.map(b => b._id);
      await Booking.deleteMany({ _id: { $in: bookingIdsToDelete } });
    }

    await booking.save();

    // Seats are NOT deducted here. They will be deducted when the driver confirmed the ride.

    // Create notification for the driver
    try {
      await Notification.create({
        recipient: trip.driver,
        sender: userId,
        type: "booking_request",
        message: "A new passenger has requested to join your trip.",
        relatedTrip: tripId,
        relatedBooking: booking._id,
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
      // We don't fail the whole booking process if notification fails
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ msg: "Booking request sent to driver", booking }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ msg: error.message || "Server error" }, { status: 500 });
  }
}
