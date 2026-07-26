import { Server, Socket } from 'socket.io';
import { verifyToken } from '../config/jwt';
import { prisma } from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining conversation room
    socket.on('join-conversation', (data: { receiverId: string }) => {
      const room = [socket.userId, data.receiverId].sort().join(':');
      socket.join(`conversation:${room}`);
    });

    // Handle leaving conversation room
    socket.on('leave-conversation', (data: { receiverId: string }) => {
      const room = [socket.userId, data.receiverId].sort().join(':');
      socket.leave(`conversation:${room}`);
    });

    // Handle sending message
    socket.on(
      'send-message',
      async (data: { receiverId: string; content: string; orderId?: string }) => {
        try {
          // Save message to database
          const message = await prisma.message.create({
            data: {
              senderId: socket.userId!,
              receiverId: data.receiverId,
              orderId: data.orderId,
              content: data.content,
            },
            include: {
              sender: {
                include: { profile: true },
              },
              receiver: {
                include: { profile: true },
              },
            },
          });

          // Emit to conversation room
          const room = [socket.userId, data.receiverId].sort().join(':');
          io.to(`conversation:${room}`).emit('new-message', message);

          // Emit to receiver's personal room for notification
          io.to(`user:${data.receiverId}`).emit('message-notification', {
            type: 'new-message',
            message,
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    // Handle typing indicator
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      const room = [socket.userId, data.receiverId].sort().join(':');
      socket.to(`conversation:${room}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle mark as read
    socket.on('mark-read', async (data: { senderId: string }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId: data.senderId,
            receiverId: socket.userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        // Notify sender that messages were read
        io.to(`user:${data.senderId}`).emit('messages-read', {
          readerId: socket.userId,
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
