// app/api/conversation/update-status/route.js (BONUS - Update message status)
import { NextResponse } from 'next/server';
import {connectDB} from './../../../lib/db';
import Message from '../../../lib/Model/message.js';
import ConversationHistory from '../../../lib/Model/ConversationHistory.js';

export async function PATCH(request) {
  try {
    await connectDB();
    const { messageId, chatId, status } = await request.json();

    // Update in Message collection
    await Message.findByIdAndUpdate(messageId, { status });

    // Update in ConversationHistory
    await ConversationHistory.updateOne(
      { chatId, 'messages.messageId': messageId },
      { $set: { 'messages.$.status': status } }
    );

    return NextResponse.json({
      success: true,
      messageId,
      status
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}