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
  }
}, {
  timestamps: true
});

ChatSchema.index({ participants: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);