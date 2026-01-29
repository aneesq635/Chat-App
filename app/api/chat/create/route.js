// create a chat if exist return it
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongoPromise";

export async function POST(request) {
  try {
    const { participantsID, type = "direct" } = await request.json();
    const client = await clientPromise;
    const db = client.db("NexTalk");
    // const users = db.collection("users");

    // const participantDetails = await users
    //   .find({ supabaseId: { $in: participantsID } })
    //   .toArray();

    const chat = db.collection("chat");
    const existingChat = await chat.findOne({
      participant: { $all: participantsID },
    });
    if (existingChat) {
      return NextResponse.json({ success: true, chat: existingChat });
    }

    const participantMeta = {};
    participantsID.foreach((supabaseId) => {
      participantMeta[supabaseId] = {
        unreadCount: 0,
      };
    });

    const newChat = {
      participant: participantsID,
      lastMessage: {
        text: "",
        timestamp: null,
      },
      participantMeta,
      type: "direct",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await chat.insertOne(newChat);

    return NextResponse.json({
      success: true,
      chat: { _id: result.insertedId, ...newChat },
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
