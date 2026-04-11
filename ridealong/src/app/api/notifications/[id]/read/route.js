import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const { authenticated, userId } = await requireAuth();
    if (!authenticated) {
      return NextResponse.json({ msg: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId }, // Ensure user owns the notification
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ msg: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
