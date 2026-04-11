import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User.vehicles", // This might be tricky since it's a subdoc, but let's just use it conceptually or store ID
    },
    vehicleId: String, // Simpler to store the ID string if ref is complex
    vehicleType: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    sourceCoords: {
        lat: Number,
        lng: Number
    },
    destinationCoords: {
        lat: Number,
        lng: Number
    },
    sourcePoint: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] } // MongoDB standard: [lng, lat]
    },
    destinationPoint: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] }
    },
    date: {
      type: Date,
      required: true,
    },
    distance: {
      type: Number, // in km
    },
    pricePerSeat: {
      type: Number, // calculated automatically using AI distance logic
    },
    duration: {
      type: Number, // in mins
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    cancelReason: {
      type: String,
      default: "",
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    },
    routeWaypoints: [{
      lat: Number,
      lng: Number
    }],
    lastLocationUpdate: {
      type: Date,
      default: Date.now
    },
  },
  { timestamps: true }
);

// Advanced Phase 3 MongoDB Geospatial Indices allowing massive radius searching
tripSchema.index({ sourcePoint: '2dsphere' });
tripSchema.index({ destinationPoint: '2dsphere' });

export default mongoose.models.Trip || mongoose.model("Trip", tripSchema);
