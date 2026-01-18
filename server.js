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

        // Save message to database
        const message = await Message.create({
          chatId,
          senderId,
          text,
          timestamp: new Date(),
          status: 'sent'
        });

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text,
          lastMessageTime: new Date()
        });

        const messageData = {
          id: message._id.toString(),
          chatId,
          senderId,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          createdAt: message.createdAt
        };

        // Emit to chat room
        io.to(`chat:${chatId}`).emit('new-message', messageData);

        // Emit to receiver's personal room
        if (receiverId) {
          io.to(`user:${receiverId}`).emit('chat-updated', {
            chatId,
            lastMessage: text,
            timestamp: 'Just now'
          });
        }

        // Confirm to sender
        socket.emit('message-sent', { 
          tempId, 
          messageId: message._id.toString() 
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message', tempId: data.tempId });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
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