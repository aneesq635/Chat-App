import { Server } from 'socket.io';
import { connectDB } from './../../lib/db';
import Message from '../../lib/Model/message';
import Chat from '../../lib/Model/Chat';

let io;

export async function GET(req) {
  if (!io) {
    const httpServer = req.socket.server;
    io = new Server(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    await connectDB();

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

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
      });

      // Handle new message
      socket.on('send-message', async (data) => {
        try {
          const { chatId, senderId, text, receiverId } = data;

          // Save message to database
          const message = await Message.create({
            chatId,
            senderId,
            text,
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
            status: 'sent'
          };

          // Emit to chat room
          io.to(`chat:${chatId}`).emit('new-message', messageData);

          // Emit to receiver's personal room for notifications
          if (receiverId) {
            io.to(`user:${receiverId}`).emit('chat-updated', {
              chatId,
              lastMessage: text,
              timestamp: 'Just now'
            });
          }
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicator
      socket.on('typing', ({ chatId, userId, isTyping }) => {
        socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
      });

      // Handle message status update
      socket.on('update-message-status', async ({ messageId, status }) => {
        try {
          await Message.findByIdAndUpdate(messageId, { status });
          socket.emit('message-status-updated', { messageId, status });
        } catch (error) {
          console.error('Error updating message status:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket server initialized', { status: 200 });
}