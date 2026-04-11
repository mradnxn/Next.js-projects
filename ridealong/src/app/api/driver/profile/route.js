import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
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

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get driver profile error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
