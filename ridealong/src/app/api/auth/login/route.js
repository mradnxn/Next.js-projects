import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { msg: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { msg: "Invalid Credentials" },
        { status: 400 }
      );
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { msg: "Invalid Credentials" },
        { status: 400 }
      );
    }

    // Generate token and set cookie
    const cookieStore = await cookies();
    generateToken(user._id.toString(), cookieStore);

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      isDriverVerified: user.isDriverVerified,
      aadhaarNumber: user.aadhaarNumber,
      drivingLicenseNumber: user.drivingLicenseNumber,
    };

    return NextResponse.json(
      { msg: "Login Successful", user: userResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
