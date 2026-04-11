import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(request) {
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

    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { msg: "Please provide current and new password" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { msg: "New password must be at least 6 characters long" },
        { status: 400 }
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

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { msg: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password and update
    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json(
      { msg: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { msg: "Server error" },
      { status: 500 }
    );
  }
}
