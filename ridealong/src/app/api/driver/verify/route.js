import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, ignore error
    }

    // Save Aadhaar image
    const aadhaarBytes = await aadhaarImageFile.arrayBuffer();
    const aadhaarBuffer = Buffer.from(aadhaarBytes);
    const aadhaarFileName = `${Date.now()}-aadhaar-${aadhaarImageFile.name}`;
    const aadhaarPath = path.join(uploadsDir, aadhaarFileName);
    await writeFile(aadhaarPath, aadhaarBuffer);

    // Save Driving License image
    const licenseBytes = await drivingLicenseImageFile.arrayBuffer();
    const licenseBuffer = Buffer.from(licenseBytes);
    const licenseFileName = `${Date.now()}-license-${drivingLicenseImageFile.name}`;
    const licensePath = path.join(uploadsDir, licenseFileName);
    await writeFile(licensePath, licenseBuffer);

    // Update user with driver verification details
    const user = await User.findByIdAndUpdate(
      userId,
      {
        aadhaarNumber,
        drivingLicenseNumber,
        aadhaarImage: `/uploads/${aadhaarFileName}`,
        drivingLicenseImage: `/uploads/${licenseFileName}`,
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
