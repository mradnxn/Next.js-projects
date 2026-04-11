import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Trip from "@/models/Trip";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

// GET - Fetch chat history for a specific trip
export async function GET(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id: tripId } = await params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ msg: "Trip not found" }, { status: 404 });
    }

    // Check if user is the driver OR has a confirmed booking on this trip
    const isDriver = trip.driver.toString() === userId;
    const confirmedBooking = await Booking.findOne({ 
        trip: tripId, 
        rider: userId, 
        status: "confirmed" 
    });

    if (!isDriver && !confirmedBooking) {
      return NextResponse.json({ msg: "Only confirmed riders and driver can access chat", forbidden: true }, { status: 200 });
    }

    // Fetch messages, populate sender name and profilePhoto
    const messages = await Message.find({ trip: tripId })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: 1 }); // Ascending order (oldest first)

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Fetch chat error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id: tripId } = await params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ msg: "Trip not found" }, { status: 404 });
    }

    // Check if user is driver OR a confirmed rider
    const isDriver = trip.driver.toString() === userId;
    const confirmedBooking = await Booking.findOne({ 
        trip: tripId, 
        rider: userId, 
        status: "confirmed" 
    });

    if (!isDriver && !confirmedBooking) {
      return NextResponse.json({ msg: "Only confirmed riders and driver can post in chat" }, { status: 403 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ msg: "Message content cannot be empty" }, { status: 400 });
    }

    const message = new Message({
      trip: tripId,
      sender: userId,
      content: content.trim()
    });

    await message.save();

    // Create notifications for other users
    try {
      const allConfirmedBookings = await Booking.find({ trip: tripId, status: "confirmed" });
      const recipients = allConfirmedBookings
         .map(b => b.rider ? b.rider.toString() : null)
         .filter(r => r && r !== userId);
      
      const isSenderDriver = trip.driver.toString() === userId;
      if (!isSenderDriver) {
          recipients.push(trip.driver.toString());
      }



      const senderUser = await User.findById(userId);

      if (recipients.length > 0) {
          const notifications = recipients.map(recipientId => ({
              recipient: new mongoose.Types.ObjectId(recipientId),
              sender: new mongoose.Types.ObjectId(userId),
              type: "chat_message",
              message: `${senderUser?.name || 'Someone'} sent a message: "${content.trim()}"`,
              relatedTrip: new mongoose.Types.ObjectId(tripId)
          }));
          const inserted = await Notification.insertMany(notifications);
      }
    } catch (notifError) {
       console.error("[Chat Notification] CRASH ERROR Stack Trace:", notifError);
       if (notifError.errors) {
           console.error("[Chat Notification] Validation Errors Detail:", JSON.stringify(notifError.errors, null, 2));
       }
    }

    // Populate sender details before returning
    const populatedMessage = await Message.findById(message._id).populate("sender", "name profilePhoto");

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
