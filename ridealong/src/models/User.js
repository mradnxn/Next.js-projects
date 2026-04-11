import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  color: { type: String },
  plateNumber: { type: String },
  seats: { type: Number },
  registrationImage: { type: String },          // path to RC photo
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  verificationNote: { type: String },           // reason if rejected
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String }, // Optional for OAuth accounts
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    gender: { type: String, enum: ["male", "female"], required: true, default: "male" },

    // Profile photo
    profilePhoto: String,

    // Vehicles
    vehicles: [vehicleSchema],

    // Driver verification fields
    aadhaarNumber: String,
    aadhaarImage: String,
    drivingLicenseNumber: String,
    drivingLicenseImage: String,

    isDriverVerified: {
      type: Boolean,
      default: false,
    },

    // Community Trust Mechanics
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
