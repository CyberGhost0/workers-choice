import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, serviceId, scheduledDate, totalAmount } = req.body;

    // Verify provider exists
    const provider = await prisma.businessProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw createError('Provider not found', 404);
    }

    // Calculate platform fee (10%)
    const platformFee = totalAmount * 0.1;
    const providerPayout = totalAmount - platformFee;

    const order = await prisma.order.create({
      data: {
        customerId: req.userId!,
        providerId,
        serviceId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        totalAmount,
        platformFee,
        providerPayout,
        status: 'PENDING',
      },
      include: {
        customer: {
          include: { profile: true },
        },
        provider: true,
        service: true,
      },
    });

    res.status(201).json({
      order,
      message: 'Order created. Please complete payment to confirm booking.',
    });
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: { profile: true },
        },
        provider: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        service: true,
        reviews: true,
        jobPhotos: true,
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check authorization
    if (order.customerId !== req.userId && order.provider.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    res.json({ order });
  } catch (error) {
    throw error;
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.userId },
      include: {
        provider: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    throw error;
  }
};

export const getProviderOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Get provider's business profile
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!businessProfile) {
      throw createError('Business profile not found', 404);
    }

    const orders = await prisma.order.findMany({
      where: { providerId: businessProfile.id },
      include: {
        customer: {
          include: { profile: true },
        },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check authorization
    if (order.customerId !== req.userId && order.provider.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json({ order: updatedOrder });
  } catch (error) {
    throw error;
  }
};

export const confirmOrderCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check if user is customer or provider
    const isCustomer = order.customerId === req.userId;
    const isProvider = order.provider.userId === req.userId;

    if (!isCustomer && !isProvider) {
      throw createError('Not authorized', 403);
    }

    // Update confirmation status
    const updateData: any = {};
    if (isCustomer) {
      updateData.customerConfirmed = true;
    }
    if (isProvider) {
      updateData.providerConfirmed = true;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Check if both parties have confirmed
    const customerConfirmed = isCustomer ? true : updatedOrder.customerConfirmed;
    const providerConfirmed = isProvider ? true : updatedOrder.providerConfirmed;

    if (customerConfirmed && providerConfirmed) {
      // Both confirmed - mark as completed and trigger payment release
      await prisma.order.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // TODO: Trigger Stripe transfer to provider
      // This will be implemented in the payment service

      res.json({
        order: { ...updatedOrder, status: 'COMPLETED', completedAt: new Date() },
        message: 'Job completed! Payment will be released to the provider.',
      });
    } else {
      res.json({
        order: updatedOrder,
        message: `Confirmation recorded. Waiting for ${isCustomer ? 'provider' : 'customer'} confirmation.`,
      });
    }
  } catch (error) {
    throw error;
  }
};
