import { connectDB } from '../../../lib/db';
import Chat from '../../../lib/Model/Chat';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('Received body:', body); // DEBUG
    const { participants, type = 'direct' } = body;
    console.log("participants", participants)

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants required' },
        { status: 400 }
      );
    }

    // Check if chat already exists between these participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (existingChat) {
      return NextResponse.json({ 
        chat: {
          _id: existingChat._id.toString(),
          participants: existingChat.participants,
          lastMessage: existingChat.lastMessage,
          lastMessageTime: existingChat.lastMessageTime
        }
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      participants,
      type,
      lastMessage: '',
      lastMessageTime: new Date()
    });

    return NextResponse.json({ 
      chat: {
        _id: newChat._id.toString(),
        participants: newChat.participants,
        lastMessage: newChat.lastMessage,
        lastMessageTime: newChat.lastMessageTime
      }
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: error.message },
      { status: 500 }
    );
  }
}