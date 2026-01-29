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
      .find({ participants: userId })
      .sort({ lastMessage: { timestamp: -1 } })
      .toArray();

    const chatsArray = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipantid = chat.participants.filter(
          (id) => id !== userId,
        );
        const participantDetails = await users
          .find(
            { supabaseId: otherParticipantid },
            {
              projection: {
                supabaseId: 1,
                userId: 1,
                name: 1,
                email: 1,
                avatar: 1,
                bio: 1,
                status: 1,
                lastSeen: 1,
              },
            },
          )
          .toArray();

        return {
          _id: chat._id,
          participants: chat.participants,
          participantDetails,
          participantmeta: chat.participantmeta[otherParticipantid],
          lastMessage: chat.lastMessage.text,
          timestamp: chat.lastMessage.timestamp,
          status: participantDetails.status,
        };
      }),
    );
    return NextResponse.json({ success: true, chats: chatsArray });
  } catch (err) {
    console.log("error occur while fetching chats", err);
    return NextResponse.json({ success: true, error: err });
  }
}
