import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";

// PATCH - Update booking status (Driver only)
export async function PATCH(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id: bookingId } = await params;
    const { status } = await request.json();

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
        return NextResponse.json({ msg: "Invalid status update" }, { status: 400 });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("trip");
    if (!booking) {
      return NextResponse.json({ msg: "Booking not found" }, { status: 404 });
    }

    const trip = booking.trip;
    if (!trip) {
       return NextResponse.json({ msg: "Associated trip not found" }, { status: 404 });
    }

    const isDriver = trip.driver.toString() === userId;
    const isRider = booking.rider.toString() === userId;

    if (status === 'cancelled') {
        if (!isRider) {
             return NextResponse.json({ msg: "Only the rider can cancel their booking" }, { status: 403 });
        }
        
        // If already confirmed, restore seats back to the trip
        if (booking.status === 'confirmed') {
             trip.seats += booking.seatsBooked;
             await trip.save();
        }
    } else {
        // For confirmed or rejected, only driver is authorized
        if (!isDriver) {
            return NextResponse.json({ msg: "Only the driver can update booking status" }, { status: 403 });
        }

        // If booking is already confirmed, do nothing
        if (booking.status === 'confirmed') {
            return NextResponse.json({ msg: "Booking is already confirmed" }, { status: 400 });
        }

        // Logic for Confirmation
        if (status === 'confirmed') {
            // Check seat availability again
            if (trip.seats < booking.seatsBooked) {
                 return NextResponse.json({ msg: "Not enough seats available" }, { status: 400 });
            }
            
            // Deduct seats
            trip.seats -= booking.seatsBooked;
            await trip.save();
        }
    }

    // Update booking Status
    booking.status = status;
    await booking.save();

    // Create notification
    try {
      let message, recipientId, type;
      if (status === 'cancelled') {
           message = "A rider has cancelled their booking on your trip.";
           recipientId = trip.driver;
           type = "booking_rejected"; // Leverage design icons for cancel alerts
      } else if (status === 'confirmed') {
           message = "Your booking request has been confirmed!";
           recipientId = booking.rider;
           type = "booking_accepted";
      } else {
           message = "Your booking request was declined.";
           recipientId = booking.rider;
           type = "booking_rejected";
      }
        
      await Notification.create({
        recipient: recipientId,
        sender: userId,
        type,
        message,
        relatedTrip: trip._id,
        relatedBooking: booking._id,
      });
    } catch (notifErr) {
       console.error("Failed to create notification:", notifErr);
    }

    return NextResponse.json({ msg: `Booking ${status}`, booking }, { status: 200 });

  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
