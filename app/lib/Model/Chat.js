// app/lib/Model/Chat.js
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  // NEW: Reference to conversation history
  conversationHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConversationHistory'
  }
}, {
  timestamps: true
});

ChatSchema.index({ participants: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);