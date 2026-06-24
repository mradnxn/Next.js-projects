import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// DELETE a vehicle by ID
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    const { vehicleId } = await params;

    // Use $pull to remove by _id — MongoDB handles ObjectId matching natively
    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { vehicles: { _id: new mongoose.Types.ObjectId(vehicleId) } } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    // If no vehicle was removed, it wasn't found — but still return success with current vehicles
    // (frontend already removed it from state)
    return NextResponse.json(
      { msg: "Vehicle removed successfully", vehicles: result.vehicles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

// PATCH set a vehicle as default
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    const { vehicleId } = await params;
    const user = await User.findById(userId);

    user.vehicles.forEach((v) => {
      v.isDefault = v._id.toString() === vehicleId;
    });

    await user.save();

    return NextResponse.json(
      { msg: "Default vehicle updated", vehicles: user.vehicles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Set default vehicle error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

// PUT re-verify a vehicle (uses stored image or accepts new FormData upload)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    const { vehicleId } = await params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }


    const vehicle = user.vehicles.find((v) => v._id.toString() === vehicleId);
    if (!vehicle) {
      return NextResponse.json({ msg: "Vehicle not found" }, { status: 404 });
    }

    // Try to get a new image from FormData (optional)
    let imageBuffer = null;
    let mimeType = "image/jpeg";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const newFile = formData.get("registrationImage");
      if (newFile && newFile.size > 0) {
        const bytes = await newFile.arrayBuffer();
        imageBuffer = Buffer.from(bytes);
        mimeType = newFile.type;
        vehicle.registrationImage = `data:${newFile.type};base64,${imageBuffer.toString("base64")}`;
      }
    }

    // Fall back to stored image if no new file uploaded
    if (!imageBuffer && vehicle.registrationImage) {
      if (vehicle.registrationImage.startsWith("data:")) {
        const matches = vehicle.registrationImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], "base64");
        }
      } else {
        const { readFile } = await import("fs/promises");
        const imagePath = join(process.cwd(), "public", vehicle.registrationImage);
        try {
          imageBuffer = await readFile(imagePath);
          const ext = vehicle.registrationImage.split(".").pop().toLowerCase();
          const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
          mimeType = mimeMap[ext] || "image/jpeg";
        } catch {
        }
      }
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { msg: "No registration image available. Please delete this vehicle and re-add it with an RC photo." },
        { status: 400 }
      );
    }

    let status = "pending";
    let verificationNote = "";

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const imageBase64 = imageBuffer.toString("base64");

      const prompt = `You are verifying an Indian vehicle Registration Certificate (RC) document.

 Extract the following fields from the RC document image and return ONLY a valid JSON object (no markdown, no explanation):
 {
   "registrationNumber": "...",
   "ownerName": "...",
   "vehicleClass": "...",
   "maker": "...",
   "model": "...",
   "color": "...",
   "seats": number,
   "registrationValidUpto": "DD/MM/YYYY or similar date string",
   "isExpired": true or false
 }
 
 Rules:
 - "registrationNumber" should be the vehicle plate/registration number (e.g. MH12AB1234)
 - "isExpired": set to true if the registration validity date is before today (${new Date().toLocaleDateString("en-IN")})
 - "seats": extract the seating capacity as a number
 - If a field is not visible or not found, use null
 - Return ONLY the JSON, nothing else`;
 
       const result = await geminiModel.generateContent([
         prompt,
         { inlineData: { mimeType, data: imageBase64 } },
       ]);
 
       const rawText = result.response.text().trim();
 
       const jsonMatch = rawText.match(/\{[\s\S]*\}/);
       if (!jsonMatch) throw new Error("No JSON in Gemini response");
       const rcData = JSON.parse(jsonMatch[0]);
 
       const issues = [];
 
       if (rcData.isExpired === true) {
         issues.push("Registration certificate is expired");
       }
 
       if (vehicle.plateNumber && rcData.registrationNumber) {
         const normalize = (s) => s.replace(/\s+/g, "").toUpperCase();
         if (normalize(vehicle.plateNumber) !== normalize(rcData.registrationNumber)) {
           issues.push(
             `Plate number mismatch: vehicle has "${vehicle.plateNumber.toUpperCase()}" but RC shows "${rcData.registrationNumber}"`
           );
         }
       }
 
       if (vehicle.color && rcData.color) {
         const userColor = vehicle.color.toLowerCase().trim();
         const rcColor = rcData.color.toLowerCase().trim();
         if (!rcColor.includes(userColor) && !userColor.includes(rcColor)) {
           issues.push(
             `Color mismatch: vehicle has "${vehicle.color}" but RC shows "${rcData.color}"`
           );
         }
       }
 
       // Check seating capacity match
       if (vehicle.seats && rcData.seats) {
         if (Number(vehicle.seats) !== Number(rcData.seats)) {
           issues.push(
             `Seating capacity mismatch: vehicle has "${vehicle.seats}" but RC shows "${rcData.seats}"`
           );
         }
       }
 
       if (issues.length === 0) {
         status = "verified";
         verificationNote = `Verified via RC. Reg No: ${rcData.registrationNumber}, Seats: ${rcData.seats}, Valid upto: ${rcData.registrationValidUpto}`;
         // Ensure we update the seats field from verified RC data
         if (rcData.seats) {
           vehicle.seats = Number(rcData.seats);
         }
       } else {
         status = "rejected";
         verificationNote = issues.join("; ");
       }
    } catch (aiError) {
      console.error("Re-verify Gemini error:", aiError?.message || aiError);
      console.error("Full error details:", aiError);
      status = "pending";
      verificationNote = `Verification failed: ${aiError?.message || "Unknown error"}`;
    }

    vehicle.status = status;
    vehicle.verificationNote = verificationNote;
    await user.save();

    return NextResponse.json(
      {
        msg: status === "verified" ? "Vehicle verified!" : `Verification result: ${verificationNote}`,
        vehicles: user.vehicles,
        status,
        verificationNote,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Re-verify error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
