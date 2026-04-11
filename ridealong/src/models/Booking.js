import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    seatsBooked: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "confirmed", // Auto-confirm for now as per simple logic
    },
    pickupLocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date
    }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
