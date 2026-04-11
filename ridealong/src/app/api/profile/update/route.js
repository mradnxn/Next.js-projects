import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function PUT(request) {
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

    const { name, email } = await request.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { msg: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return NextResponse.json(
        { msg: "Email already in use" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    revalidatePath("/", "layout");

    return NextResponse.json(
      { 
        msg: "Profile updated successfully",
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { msg: "Server error" },
      { status: 500 }
    );
  }
}
