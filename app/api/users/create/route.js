import { NextResponse } from "next/server";
import mongoPromise from "../../../lib/mongoPromise";
import { nanoid } from "nanoid";

const generateUserId = () => {
  return nanoid(10);
};

export async function POST(request) {
  try {
    const { supabaseId, email, name, avatar } = await request.json();
    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const client = await mongoPromise;
    console.log("Connected to MongoDB");
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({ supabaseId });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 200 }
      );
    }
    const newUser = {
      userId: generateUserId(),
      supabaseId,
      email,
      name: name || "New User",
      avatar: avatar || "",
      createdAt: new Date(),
      bio: "Hey there! I am using NexTalk.",
      status: "", // e.g., "Online", "Offline"
    };
    await usersCollection.insertOne(newUser);
    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
