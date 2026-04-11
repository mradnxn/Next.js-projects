import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { msg: "Email and new password are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { msg: "User with this email not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { msg: "Password successfully updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
