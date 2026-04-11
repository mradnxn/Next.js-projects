import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Trip from "@/models/Trip";
import { requireAuth, clearToken } from "@/lib/auth";

export async function DELETE(request) {
  try {
    await connectDB();

    // Check authentication
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json(
        { msg: "Not authorized" },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    // Delete all trips created by this user
    await Trip.deleteMany({ driver: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Clear authentication cookie
    const response = NextResponse.json(
      { msg: "Account deleted successfully" },
      { status: 200 }
    );
    
    clearToken(response);
    
    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { msg: "Server error" },
      { status: 500 }
    );
  }
}
