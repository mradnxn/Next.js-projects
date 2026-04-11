import { NextResponse } from "next/server";
import { clearToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    clearToken(cookieStore);

    return NextResponse.json(
      { msg: "Logged out" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
