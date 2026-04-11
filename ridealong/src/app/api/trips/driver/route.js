import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all trips created by the authenticated driver
export async function GET() {
  try {
    const { authenticated, userId } = await requireAuth();
    
    if (!authenticated) {
      return NextResponse.json(
        { msg: "Not authorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch the last 20 trips for this driver
    const trips = await Trip.find({ driver: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    console.error("Fetch driver trips error:", error);
    return NextResponse.json(
      { msg: "Server error while fetching your trips" },
      { status: 500 }
    );
  }
}
