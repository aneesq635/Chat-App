import { NextResponse } from "next/server";

import mongoPromise from "../../../lib/mongoPromise";

export async function GET(req,
  { params }) {
  try {
    console.log("Fetching user with id:", params.id);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }
    const client = await mongoPromise;
    console.log("Connected to MongoDB");
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ supabaseId: id });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}