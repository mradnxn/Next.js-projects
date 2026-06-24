import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

// GET all vehicles for the user
export async function GET() {
  try {
    await connectDB();
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }
    const user = await User.findById(userId).select("vehicles");
    return NextResponse.json({ vehicles: user.vehicles || [] }, { status: 200 });
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}

// POST add a new vehicle with registration verification
export async function POST(request) {
  try {
    await connectDB();
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const make = formData.get("make");
    const model = formData.get("model");
    const year = formData.get("year");
    const color = formData.get("color");
    const plateNumber = formData.get("plateNumber");
    const seats = formData.get("seats");
    const isDefault = formData.get("isDefault") === "true";
    const registrationFile = formData.get("registrationImage");

    if (!make || !model) {
      return NextResponse.json({ msg: "Vehicle make and model are required" }, { status: 400 });
    }

    if (!seats) {
      return NextResponse.json({ msg: "Seating capacity is required" }, { status: 400 });
    }

    if (!registrationFile) {
      return NextResponse.json({ msg: "Vehicle registration photo is required" }, { status: 400 });
    }

    // Save registration image as Base64 Data URI
    const bytes = await registrationFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const registrationImagePath = `data:${registrationFile.type};base64,${buffer.toString("base64")}`;

    // --- Gemini Vision Verification ---
    let status = "pending";
    let verificationNote = "";
    let rcData = null;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const imageBase64 = buffer.toString("base64");
      const mimeType = registrationFile.type;

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
- "seats": extraction the seating capacity as a number
- If a field is not visible or not found, use null
- Return ONLY the JSON, nothing else`;

      const result = await geminiModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
      ]);

      const rawText = result.response.text().trim();

      // Parse JSON from Gemini response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in Gemini response");
      rcData = JSON.parse(jsonMatch[0]);



      // --- Validation checks ---
      const issues = [];

      // 1. Check expiry
      if (rcData.isExpired === true) {
        issues.push("Registration certificate is expired");
      }

      // 2. Check plate number match (normalize: remove spaces, uppercase)
      if (plateNumber && rcData.registrationNumber) {
        const normalize = (s) => s.replace(/\s+/g, "").toUpperCase();
        if (normalize(plateNumber) !== normalize(rcData.registrationNumber)) {
          issues.push(
            `Plate number mismatch: you entered "${plateNumber.toUpperCase()}" but RC shows "${rcData.registrationNumber}"`
          );
        }
      }

      // 3. Check color match (fuzzy - check if user color appears in RC color)
      if (color && rcData.color) {
        const userColor = color.toLowerCase().trim();
        const rcColor = rcData.color.toLowerCase().trim();
        if (!rcColor.includes(userColor) && !userColor.includes(rcColor)) {
          issues.push(
            `Color mismatch: you entered "${color}" but RC shows "${rcData.color}"`
          );
        }
      }

      // 4. Check seating capacity match
      if (seats && rcData.seats) {
        if (Number(seats) !== Number(rcData.seats)) {
          issues.push(
            `Seating capacity mismatch: you entered "${seats}" but RC shows "${rcData.seats}"`
          );
        }
      }

      if (issues.length === 0) {
        status = "verified";
        // Update the seats value from verified RC data
        if (rcData.seats) {
          verificationNote = `Verified via RC. Reg No: ${rcData.registrationNumber}, Seats: ${rcData.seats}, Valid upto: ${rcData.registrationValidUpto}`;
        } else {
          verificationNote = `Verified via RC. Reg No: ${rcData.registrationNumber}, Valid upto: ${rcData.registrationValidUpto}`;
        }
      } else {
        status = "rejected";
        verificationNote = issues.join("; ");
      }
    } catch (aiError) {
      console.error("Gemini verification error:", aiError?.message || aiError);
      console.error("Full error details:", aiError);
      // If AI fails, mark as pending with a clear reason
      status = "pending";
      const errMsg = aiError?.message || "";
      if (errMsg.includes("API_KEY") || errMsg.includes("API key")) {
        verificationNote = "Verification failed: Invalid or missing Gemini API key. Contact support.";
      } else if (errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        verificationNote = "Verification failed: API quota exceeded. Try again later.";
      } else if (errMsg.includes("SAFETY") || errMsg.includes("safety")) {
        verificationNote = "Verification failed: Image was blocked by safety filters. Please upload a clear RC document photo.";
      } else if (errMsg.includes("No JSON")) {
        verificationNote = "Verification failed: Could not read the RC document. Please upload a clearer photo of the registration certificate.";
      } else {
        verificationNote = `Verification failed: ${errMsg || "Unknown error"}. Please try uploading a clearer RC photo.`;
      }
    }

    // Add vehicle to user
    const user = await User.findById(userId);

    if (isDefault || user.vehicles.length === 0) {
      user.vehicles.forEach((v) => (v.isDefault = false));
    }

    const shouldBeDefault = isDefault || user.vehicles.length === 0;

    user.vehicles.push({
      make,
      model,
      year: year ? Number(year) : undefined,
      color,
      plateNumber,
      seats: (status === "verified" && rcData?.seats) ? Number(rcData.seats) : Number(seats),
      registrationImage: registrationImagePath,
      status,
      verificationNote,
      isDefault: shouldBeDefault,
    });

    await user.save();

    revalidatePath("/", "layout");

    return NextResponse.json(
      {
        msg: status === "verified"
          ? "Vehicle verified and added successfully!"
          : status === "rejected"
          ? `Vehicle added but verification failed: ${verificationNote}`
          : "Vehicle added, pending verification.",
        vehicles: user.vehicles,
        status,
        verificationNote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add vehicle error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
