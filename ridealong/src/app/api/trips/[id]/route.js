import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET - Get single trip by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const trip = await Trip.findById(id).populate("driver", "name isDriverVerified");
    
    if (!trip) {
      return NextResponse.json(
        { msg: "Trip not found" },
        { status: 404 }
      );
    }

    // Lazy evaluation for auto-cancellation
    const now = new Date();
    let autoCancelled = false;

    if (trip.status === "scheduled" && trip.date && now > new Date(trip.date.getTime() + 15 * 60 * 1000)) {
      trip.status = "cancelled";
      trip.cancelReason = "Automatically cancelled: Driver delayed by more than 15 minutes. We apologize for the inconvenience.";
      autoCancelled = true;
    } else if (trip.status === "in-progress" && trip.lastLocationUpdate) {
      if (now > new Date(trip.lastLocationUpdate.getTime() + 5 * 60 * 1000)) {
        trip.status = "cancelled";
        trip.cancelReason = "Automatically cancelled: Driver has not moved for 5 minutes after starting. We apologize for the inconvenience.";
        autoCancelled = true;
      }
    }

    if (autoCancelled) {
      await trip.save();
      // Notify riders about the auto-cancellation
      try {
        const bookings = await Booking.find({ trip: id });
        if (bookings.length > 0) {
          const notifications = bookings.map(b => ({
             recipient: b.rider,
             sender: trip.driver._id,
             type: "booking_rejected", 
             message: trip.cancelReason,
             relatedTrip: id
          }));
          await Notification.insertMany(notifications);
        }
        
        // Also notify the driver
        await Notification.create({
           recipient: trip.driver._id,
           sender: trip.driver._id, // System
           type: "system_alert",
           message: "Your trip was automatically cancelled. " + trip.cancelReason,
           relatedTrip: id
        });
      } catch (notifErr) {
        console.error("Failed to notify riders of auto-cancellation:", notifErr);
      }
      revalidatePath("/", "layout"); // Ensure UI updates
    }

    return NextResponse.json(trip, { status: 200 });
  } catch (error) {
    console.error("Get trip error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update trip (protected)
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
    const updateData = await request.json();

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
        { msg: "Only the driver can update this trip" },
        { status: 403 }
      );
    }

    // Valid Cancellation States
    if (updateData.status === "cancelled") {
      if (!["scheduled", "in-progress"].includes(trip.status)) {
        return NextResponse.json(
          { msg: "You can only cancel a trip that is scheduled or in-progress." },
          { status: 400 }
        );
      }
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // If trip was cancelled, notify all riders with bookings (pending or confirmed)
    if (updateData.status === "cancelled") {
        try {
            const bookings = await Booking.find({ trip: id });
            if (bookings.length > 0) {
                 const notifications = bookings.map(b => ({
                     recipient: b.rider,
                     sender: userId,
                     type: "booking_rejected", 
                     message: `The trip from ${trip.source} to ${trip.destination} was cancelled by the driver.`,
                     relatedTrip: id
                 }));
                 await Notification.insertMany(notifications);
            }
        } catch (notifErr) {
            console.error("Failed to notify riders of trip cancellation:", notifErr);
        }
    }
    
    revalidatePath("/", "layout");

    return NextResponse.json(updatedTrip, { status: 200 });
  } catch (error) {
    console.error("Update trip error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete trip (protected)
export async function DELETE(request, { params }) {
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
        { msg: "Only the driver can delete this trip" },
        { status: 403 }
      );
    }

    await Trip.findByIdAndDelete(id);

    revalidatePath("/", "layout");

    return NextResponse.json(
      { msg: "Trip deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete trip error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
