import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getServices = async (req: any, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, latitude, longitude, radius } = req.query;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.artisan = { category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { artisan: { category: { contains: search, mode: 'insensitive' } } },
        { artisan: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        artisan: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ services });
  } catch (error) {
    throw error;
  }
};

export const getServiceById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        artisan: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    res.json({ service });
  } catch (error) {
    throw error;
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, priceType, images } = req.body;

    // Get or create business profile
    let businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!businessProfile) {
      throw createError('Business profile required. Please set up your business first.', 400);
    }

    const service = await prisma.service.create({
      data: {
        artisanId: businessProfile.id,
        title,
        description,
        price,
        priceType: priceType || 'FIXED',
        images: images || [],
      },
    });

    res.status(201).json({ service });
  } catch (error) {
    throw error;
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, priceType, images, isActive } = req.body;

    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id },
      include: { artisan: true },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    if (service.artisan.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        price,
        priceType,
        images,
        isActive,
      },
    });

    res.json({ service: updatedService });
  } catch (error) {
    throw error;
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id },
      include: { artisan: true },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    if (service.artisan.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    await prisma.service.delete({
      where: { id },
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getServicesByProvider = async (req: any, res: Response) => {
  try {
    const { providerId } = req.params;

    const services = await prisma.service.findMany({
      where: { artisanId: providerId },
      include: {
        artisan: true,
      },
    });

    res.json({ services });
  } catch (error) {
    throw error;
  }
};
