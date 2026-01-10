import clientPromise from "../../../lib/mongoPromise";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query } = await request.json();
    const client = await clientPromise;
    const db = client.db("NexTalk");
    // Search using regex for case-insensitive matching
    const users = await db
      .collection("users")
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { userId: { $regex: query, $options: "i" } },
        ],
      })
      .limit(10)
      .toArray();

    // Remove sensitive data before sending
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
