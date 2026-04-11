import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) return NextResponse.json({ msg: "Not authorized" }, { status: 401 });

    await connectDB();
    const { id: tripId } = await params;

    // Grab all reviews the logged-in user natively wrote for this specific journey
    const reviews = await Review.find({ trip: tripId, reviewer: userId });
    
    // Map their document footprints to flag the Front-End state so it doesn't pop-prompt them repeatedly
    const reviewedTargets = reviews.map(r => r.reviewee.toString());
    return NextResponse.json({ reviewedTargets }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) return NextResponse.json({ msg: "Not authorized" }, { status: 401 });

    const { targetUserId, rating, comment } = await request.json();
    if (!targetUserId || !rating) return NextResponse.json({ msg: "Missing critical fields" }, { status: 400 });

    await connectDB();
    const { id: tripId } = await params;

    // Security Gate: Ensure users can only review organically completed journeys or legitimately cancelled driver penalties
    const trip = await Trip.findById(tripId);
    if (!trip || (trip.status !== 'completed' && trip.status !== 'cancelled')) {
       return NextResponse.json({ msg: "Ratings are only securely processed against officially ended or cancelled routes." }, { status: 403 });
    }

    // Restrict duplicative spam feedback using direct Mongo DB limits constraint
    const existing = await Review.findOne({ trip: tripId, reviewer: userId, reviewee: targetUserId });
    if (existing) {
       return NextResponse.json({ msg: "Feedback has already been registered." }, { status: 400 });
    }

    await Review.create({
      trip: tripId,
      reviewer: userId,
      reviewee: targetUserId,
      rating: Number(rating),
      comment: comment?.trim() || ""
    });

    // Highly optimized averaging algorithm processing total platform standing
    const allReviews = await Review.find({ reviewee: targetUserId });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalScore / allReviews.length).toFixed(1));

    await User.findByIdAndUpdate(targetUserId, {
      rating: avgRating,
      reviewsCount: allReviews.length
    });

    return NextResponse.json({ msg: "Trust parameter securely validated and applied!", average: avgRating }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ msg: "Feedback lock triggered via database index." }, { status: 400 });
    console.error("Critical Trust Math error:", error);
    return NextResponse.json({ msg: "Fatal algorithm error." }, { status: 500 });
  }
}
