import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function POST(request) {
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

    const formData = await request.formData();
    
    const aadhaarNumber = formData.get("aadhaarNumber");
    const drivingLicenseNumber = formData.get("drivingLicenseNumber");
    const aadhaarImageFile = formData.get("aadhaarImage");
    const drivingLicenseImageFile = formData.get("drivingLicenseImage");

    if (!aadhaarNumber || !drivingLicenseNumber || !aadhaarImageFile || !drivingLicenseImageFile) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert Aadhaar image to Base64 Data URI
    const aadhaarBytes = await aadhaarImageFile.arrayBuffer();
    const aadhaarBuffer = Buffer.from(aadhaarBytes);
    const aadhaarBase64 = `data:${aadhaarImageFile.type};base64,${aadhaarBuffer.toString("base64")}`;

    // Convert Driving License image to Base64 Data URI
    const licenseBytes = await drivingLicenseImageFile.arrayBuffer();
    const licenseBuffer = Buffer.from(licenseBytes);
    const licenseBase64 = `data:${drivingLicenseImageFile.type};base64,${licenseBuffer.toString("base64")}`;

    // Update user with driver verification details
    const user = await User.findByIdAndUpdate(
      userId,
      {
        aadhaarNumber,
        drivingLicenseNumber,
        aadhaarImage: aadhaarBase64,
        drivingLicenseImage: licenseBase64,
        isDriverVerified: true
      },
      { new: true }
    ).select("-password");

    return NextResponse.json(
      { msg: "Driver verified", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Driver verification error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}

