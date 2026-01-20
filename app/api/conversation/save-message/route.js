import { NextResponse } from 'next/server';
import {connectDB} from './../../../lib/db';
import Message from './../../../lib/Model/message';
import ConversationHistory from './../../../lib/Model/ConversationHistory';
import Chat from './../../../lib/Model/Chat';

export async function POST(request) {
  try {
    await connectDB();
    const { chatId, senderId, text, receiverId } = await request.json();

    const timestamp = new Date();

    // 1. Save to Message collection (for real-time)
    const newMessage = await Message.create({
      chatId,
      senderId,
      text,
      timestamp,
      status: 'sent'
    });

    // 2. Format message for conversation history
    const formattedMessage = {
      messageId: newMessage._id.toString(),
      senderId,
      text,
      sender: 'user', // or map senderId to sender name
      timestamp: timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestampDate: timestamp,
      status: 'sent'
    };

    // 3. Update ConversationHistory
    let conversation = await ConversationHistory.findOne({ chatId });
    
    if (!conversation) {
      // Create new conversation if doesn't exist
      conversation = await ConversationHistory.create({
        chatId,
        messages: [formattedMessage],
        messageCount: 1,
        lastUpdated: timestamp
      });
    } else {
      // Add message using the model method
      conversation.messages.push(formattedMessage);
      conversation.messageCount = conversation.messages.length;
      conversation.lastUpdated = timestamp;
      await conversation.save();
    }

    // 4. Update Chat collection (last message info)
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      lastMessageTime: timestamp,
      conversationHistoryId: conversation._id
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationMessage: {
        id: formattedMessage.messageId,
        chatId,
        text: formattedMessage.text,
        sender: formattedMessage.sender,
        timestamp: formattedMessage.timestamp,
        status: formattedMessage.status
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save message' },
      { status: 500 }
    );
  }
}