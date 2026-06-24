import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const formData = await request.formData();
    const file = formData.get("profilePhoto");

    if (!file) {
      return NextResponse.json(
        { msg: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { msg: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { msg: "File size too large. Maximum 5MB allowed" },
        { status: 400 }
      );
    }

    // Convert to Base64 Data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const photoBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { profilePhoto: photoBase64 },
      { new: true }
    ).select("-password");

    return NextResponse.json(
      { 
        msg: "Profile photo uploaded successfully",
        photoPath: photoBase64,
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload profile photo error:", error);
    return NextResponse.json(
      { msg: "Server error" },
      { status: 500 }
    );
  }
}

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

    // Remove profile photo from user
    await User.findByIdAndUpdate(userId, { profilePhoto: null });

    return NextResponse.json(
      { msg: "Profile photo removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete profile photo error:", error);
    return NextResponse.json(
      { msg: "Server error" },
      { status: 500 }
    );
  }
}

