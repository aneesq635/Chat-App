import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongoPromise";

export async function GET(request, { params }) {
  try {
    const { supabaseId } = await params;

    if (!supabaseId) {
      return NextResponse.json(
        { success: false, message: "supabaseId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");

    // Find user by supabaseId
    const user = await usersCollection.findOne(
      { supabaseId },
      { projection: { _id: 0, status: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: user.status || "offline",
    });
  } catch (err) {
    console.error("Error fetching user status:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
