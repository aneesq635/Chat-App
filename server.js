const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models after connection
const Message = require('./app/lib/Model/Message.js').default;
const Chat = require('./app/lib/Model/Chat.js').default;
const ConversationHistory = require('./app/lib/Model/ConversationHistory.js').default;

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join user's personal room
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join specific chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`Socket ${socket.id} joined chat:${chatId}`);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`Socket ${socket.id} left chat:${chatId}`);
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, senderId, text, receiverId, tempId } = data;
        const timestamp = new Date();

        // 1. Save message to Message collection
        const message = await Message.create({
          chatId,
          senderId,
          text,
          timestamp,
          status: 'sent'
        });

        console.log('Message saved:', message);

        // 2. Format message for conversation history
        const formattedMessage = {
          messageId: message._id.toString(),
          senderId,
          text,
          sender: senderId === receiverId ? 'bot' : 'user',
          timestamp: timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestampDate: timestamp,
          status: 'sent'
        };

        // 3. Update or create ConversationHistory
        let conversation = await ConversationHistory.findOne({ chatId });
        
        if (!conversation) {
          conversation = await ConversationHistory.create({
            chatId,
            messages: [formattedMessage],
            messageCount: 1,
            lastUpdated: timestamp
          });
        } else {
          conversation.messages.push(formattedMessage);
          conversation.messageCount = conversation.messages.length;
          conversation.lastUpdated = timestamp;
          await conversation.save();
        }

        // 4. Update Chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text,
          lastMessageTime: timestamp,
          conversationHistoryId: conversation._id
        });

        // 5. Prepare message data for emission
        const messageData = {
          _id: message._id.toString(),
          id: message._id.toString(),
          chatId,
          senderId,
          text,
          timestamp: formattedMessage.timestamp,
          status: 'sent',
          createdAt: message.createdAt
        };

        // 6. Emit to chat room (all participants)
        io.to(`chat:${chatId}`).emit('new-message', messageData);

        // 7. Emit to receiver's personal room for notification
        if (receiverId) {
          io.to(`user:${receiverId}`).emit('chat-updated', {
            chatId,
            lastMessage: text,
            timestamp: 'Just now'
          });
        }

        // 8. Confirm to sender
        socket.emit('message-sent', { 
          tempId, 
          messageId: message._id.toString(),
          status: 'sent'
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { 
          error: 'Failed to send message', 
          tempId: data.tempId 
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
    });

    // Handle message status updates (delivered, read)
    socket.on('update-message-status', async ({ messageId, chatId, status }) => {
      try {
        // Update in Message collection
        await Message.findByIdAndUpdate(messageId, { status });

        // Update in ConversationHistory
        await ConversationHistory.updateOne(
          { chatId, 'messages.messageId': messageId },
          { $set: { 'messages.$.status': status } }
        );

        // Broadcast status update to chat room
        io.to(`chat:${chatId}`).emit('message-status-updated', { 
          messageId, 
          status 
        });

      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    // Handle marking all messages as read
    socket.on('mark-all-read', async ({ chatId, userId }) => {
      try {
        // Update all unread messages in Message collection
        await Message.updateMany(
          { 
            chatId, 
            senderId: { $ne: userId }, 
            status: { $ne: 'read' } 
          },
          { status: 'read' }
        );

        // Update in ConversationHistory
        await ConversationHistory.updateOne(
          { chatId },
          { 
            $set: { 
              'messages.$[elem].status': 'read' 
            } 
          },
          { 
            arrayFilters: [{ 
              'elem.senderId': { $ne: userId },
              'elem.status': { $ne: 'read' }
            }] 
          }
        );

        // Notify other participants
        socket.to(`chat:${chatId}`).emit('messages-read', { chatId, userId });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});