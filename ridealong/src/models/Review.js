import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person giving the rating
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person receiving the rating
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Crucial Database constraint: A user can only review another specific user exactly ONCE per single trip!
reviewSchema.index({ trip: 1, reviewer: 1, reviewee: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
