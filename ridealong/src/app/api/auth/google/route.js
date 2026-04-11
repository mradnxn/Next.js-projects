import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req) {
    try {
        const { credential } = await req.json();
        
        if (!credential) {
            return NextResponse.json({ error: "Missing Google Token" }, { status: 400 });
        }

        // Verify the external token rigorously
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "Invalid Google Identity" }, { status: 401 });
        }

        await connectDB();

        // Dynamically find or instantiate the User context
        let user = await User.findOne({ email: payload.email });

        if (!user) {
            // First time Google Sign in -> Register account!
            user = await User.create({
                email: payload.email,
                name: payload.name,
                authProvider: "google",
                profilePhoto: payload.picture,
                gender: "male" // Default, user can update later
            });
        }

        // Seamlessly issue internal generic JSON Web Token syncing exact Native State Behavior!
        const cookieStore = await cookies();
        generateToken(user._id.toString(), cookieStore);

        return NextResponse.json({ success: true, user: { name: user.name, email: user.email } }, { status: 200 });
    } catch (error) {
        console.error("Google Auth Engine Error:", error);
        return NextResponse.json({ error: "Internal Authentication Error" }, { status: 500 });
    }
}
