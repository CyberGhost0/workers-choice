import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, rating, comment, images } = req.body;

    // Verify order exists and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    if (order.status !== 'COMPLETED') {
      throw createError('Can only review completed orders', 400);
    }

    // Check if user is part of this order
    if (order.customerId !== req.userId) {
      throw createError('Not authorized to review this order', 403);
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        orderId,
        reviewerId: req.userId!,
      },
    });

    if (existingReview) {
      throw createError('You have already reviewed this order', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: req.userId!,
        revieweeId: order.providerId,
        rating,
        comment,
        images: images || [],
      },
      include: {
        reviewer: {
          include: { profile: true },
        },
      },
    });

    // Update provider's average rating
    const providerReviews = await prisma.review.findMany({
      where: { revieweeId: order.providerId },
    });

    const avgRating =
      providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;

    await prisma.businessProfile.update({
      where: { id: order.providerId },
      data: {
        averageRating: avgRating,
        totalReviews: providerReviews.length,
      },
    });

    res.status(201).json({ review });
  } catch (error) {
    throw error;
  }
};

export const getReviewsForUser = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          include: { profile: true },
        },
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    throw error;
  }
};

export const getReviewsByUser = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { reviewerId: req.userId },
      include: {
        reviewee: {
          include: { profile: true },
        },
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    throw error;
  }
};

export const getReviewsForOrder = async (req: any, res: Response) => {
  try {
    const { orderId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { orderId },
      include: {
        reviewer: {
          include: { profile: true },
        },
      },
    });

    res.json({ reviews });
  } catch (error) {
    throw error;
  }
};
