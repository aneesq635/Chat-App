import { NextResponse } from "next/server";
import mongoPromise from "../../../lib/mongoPromise";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // ✅ unwrap params FIRST

    console.log("Fetching user with id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const client = await mongoPromise;
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ supabaseId: id });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { bio } = await request.json();
    const client = await mongoPromise;
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");
    
    console.log("Updating bio for user id:", id, "to:", bio);
    
    // Use _id with ObjectId OR supabaseId as string (not ObjectId)
    const updateResult = await usersCollection.updateOne(
      // { _id: new ObjectId(id) }, // If id is MongoDB _id
      // OR
      { supabaseId: id }, // If id is supabaseId (string)
      { $set: { bio: bio } }
    );
    
    console.log("Update result:", updateResult);
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }
    
    if (updateResult.modifiedCount === 1) {
      return NextResponse.json(
        { message: "Bio updated successfully." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No changes made to the bio." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating bio:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
