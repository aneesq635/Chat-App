import { connectDB } from './../../../../lib/db';
import Chat from './../../../../lib/Model/Chat';
import { mongoPromise } from './../../../../lib/mongoPromise';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { userId } = params;

    // Get chats using Mongoose
    const chats = await Chat.find({
      participants: userId
    }).sort({ lastMessageTime: -1 });

    // Get participant details from users collection
    const client = await mongoPromise;
    const db = client.db("NexTalk");
    const usersCollection = db.collection("users");

    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const participantIds = chat.participants.filter(id => id !== userId);
        const participantDetails = await usersCollection
          .find(
            { supabaseId: { $in: participantIds } },
            { projection: { supabaseId: 1, name: 1, avatar: 1, bio: 1, _id: 0 } }
          )
          .toArray();

        return {
          _id: chat._id,
          participants: chat.participants,
          participantDetails,
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime
        };
      })
    );

    return NextResponse.json({ chats: chatsWithDetails });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}