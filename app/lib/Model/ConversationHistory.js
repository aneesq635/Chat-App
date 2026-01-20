// app/lib/Model/ConversationHistory.js
import mongoose from 'mongoose';

const ConversationMessageSchema = new mongoose.Schema({
  messageId: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  sender: { 
    type: String, 
    required: true 
  }, // 'user', 'bot', or participant name
  timestamp: { 
    type: String, 
    required: true 
  }, // Formatted time string (e.g., "10:30 AM")
  timestampDate: { 
    type: Date, 
    required: true 
  }, // Original Date object for sorting
  status: { 
    type: String, 
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sent' 
  },
}, { _id: false });

const ConversationHistorySchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  messages: [ConversationMessageSchema],
  participants: [{
    userId: String,
    name: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
ConversationHistorySchema.index({ chatId: 1 });
ConversationHistorySchema.index({ lastUpdated: -1 });

// Method to add a message
ConversationHistorySchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.messageCount = this.messages.length;
  this.lastUpdated = new Date();
  return this.save();
};

// Method to get recent messages with limit
ConversationHistorySchema.methods.getRecentMessages = function(limit = 50) {
  return this.messages.slice(-limit);
};

// Method to clear old messages (optional - for cleanup)
ConversationHistorySchema.methods.clearOldMessages = function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  this.messages = this.messages.filter(
    msg => new Date(msg.timestampDate) > cutoffDate
  );
  this.messageCount = this.messages.length;
  return this.save();
};

export default mongoose.models.ConversationHistory || 
  mongoose.model('ConversationHistory', ConversationHistorySchema);