import { NextResponse } from "next/server";
import mongoPromise from "../../../../lib/mongoPromise";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 },
      );
    }
    const client = await mongoPromise;
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ supabaseId: id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    //return user all  saved contacts details
    const contactsIds = user.contacts || [];
    const contacts = await usersCollection
      .find(
        { supabaseId: { $in: contactsIds } }, // FILTER (which documents)
        {
          projection: {
            // PROJECTION (which fields)
            supabaseId: 1,
            userId: 1,
            name: 1,
            email: 1,
            avatar: 1,
            bio: 1,
            status: 1,
            lastSeen: 1,
            _id: 0,
          },
        },
      )
      .toArray();

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
