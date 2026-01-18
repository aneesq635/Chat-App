import { connectDB } from '../../../lib/db.js';
import Message from '../../../lib/Model/message.js';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { chatId } = await params;

    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(100);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}