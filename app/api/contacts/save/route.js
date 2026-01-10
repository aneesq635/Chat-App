import { NextResponse } from "next/server";

import mongoPromise from "../../../lib/mongoPromise";
// save the contact for the user based on supabaseId and contactSupabaseId
export async function POST(request) {
  try {
    const { userId, contactSupabaseId} = await request.json();
    if (!userId || !contactSupabaseId) {
        return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const client = await mongoPromise;
    console.log("Connected to MongoDB for saving contact");
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ supabaseId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }   
    // Check if contact already exists
    if (user.contacts && user.contacts.includes(contactSupabaseId)) {
      return NextResponse.json(
        { message: "Contact already exists" },
        { status: 200 }
      );
    }
    // Add contactSupabaseId to user's contacts array
    await usersCollection.updateOne(
  { supabaseId: userId },
  { $addToSet: { contacts: contactSupabaseId } } // Just store the ID
);
    return NextResponse.json(
      { message: "Contact saved successfully" },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error saving contact:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
    