import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password, gender } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !gender) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { msg: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
    });

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
    };

    return NextResponse.json(
      { msg: "User Registered", user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
