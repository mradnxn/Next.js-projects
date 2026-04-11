import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ msg: "All notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
