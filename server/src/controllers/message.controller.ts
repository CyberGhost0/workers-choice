import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, orderId, content, attachments } = req.body;

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw createError('Receiver not found', 404);
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        receiverId,
        orderId,
        content,
        attachments: attachments || [],
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

    // TODO: Emit socket event for real-time delivery
    // This will be implemented in the socket service

    res.status(201).json({ message });
  } catch (error) {
    throw error;
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    // Get all unique users the current user has messaged with
    const sentMessages = await prisma.message.findMany({
      where: { senderId: req.userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: req.userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const userIds = [
      ...new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ];

    // Get last message for each conversation
    const conversations = await Promise.all(
      userIds.map(async (userId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: req.userId, receiverId: userId },
              { senderId: userId, receiverId: req.userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              include: { profile: true },
            },
            receiver: {
              include: { profile: true },
            },
          },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: userId,
            receiverId: req.userId,
            isRead: false,
          },
        });

        return {
          user: lastMessage?.sender.id === userId ? lastMessage?.sender : lastMessage?.receiver,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt?.getTime() || 0;
      const timeB = b.lastMessage?.createdAt?.getTime() || 0;
      return timeB - timeA;
    });

    res.json({ conversations });
  } catch (error) {
    throw error;
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: userId },
          { senderId: userId, receiverId: req.userId },
        ],
      },
      include: {
        sender: {
          include: { profile: true },
        },
        receiver: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ messages });
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw createError('Message not found', 404);
    }

    if (message.receiverId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    throw error;
  }
};
