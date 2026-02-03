import { NextResponse } from "next/server";
import clientPromise from "./../../../lib/mongoPromise";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log("userID", userId);

    const client = await clientPromise;
    const db = client.db("NexTalk");
    const users = db.collection("users");
    const chats = await db
      .collection("chat")
      .find({ participant: userId })
      .sort({ "lastMessage.timestamp": -1 })
      .toArray();

    const chatsArray = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipantid = chat.participant.filter(
          (id) => id !== userId,
        );
        console.log("otherParticipantid", otherParticipantid);
        const participantDetails = await users.findOne(
          { supabaseId: otherParticipantid[0] },
          { projection: { name: 1, avatar: 1, supabaseId: 1, userId:1, status: 1 , bio:1, _id:0, email:1} },
        );

        return {
          _id: chat._id,
          participant: chat.participant,
          participantDetails,
          participantMeta: chat.participantMeta,
          lastMessage: chat.lastMessage,
          status: participantDetails.status,
        };
      }),
    );

    console.log("chatsArray", chatsArray);
    return NextResponse.json({ success: true, chats: chatsArray });
  } catch (err) {
    console.log("error occur while fetching chats", err);
    return NextResponse.json({ success: false, error: err });
  }
}
