import { NextResponse } from 'next/server';
import {connectDB} from './../../../lib/db';
import ConversationHistory from './../../../lib/Model/ConversationHistory';
import Chat from './../../../lib/Model/Chat';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { chatId } = await params;

    // Find or create conversation history
    let conversation = await ConversationHistory.findOne({ chatId });

    if (!conversation) {
      // Create new conversation history
      const chat = await Chat.findById(chatId);
      
      conversation = await ConversationHistory.create({
        chatId,
        messages: [],
        participants: chat ? chat.participants.map(p => ({ userId: p })) : [],
        lastUpdated: new Date(),
        messageCount: 0
      });
    }

    return NextResponse.json({
      success: true,
      messages: conversation.messages.map(m => ({
        id: m.messageId,
        chatId,
        text: m.text,
        sender: m.sender,
        timestamp: m.timestamp,
        status: m.status
      })),
      messageCount: conversation.messageCount
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
