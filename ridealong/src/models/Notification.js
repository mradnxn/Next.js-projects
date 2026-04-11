import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["booking_request", "booking_accepted", "booking_rejected", "system", "chat_message"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
