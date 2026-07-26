import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getProducts = async (req: any, res: Response) => {
  try {
    const { search, minPrice, maxPrice, category } = req.query;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (category) {
      where.seller = { category };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
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

    res.json({ products });
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
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

    if (!product) {
      throw createError('Product not found', 404);
    }

    res.json({ product });
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, stockQuantity, images } = req.body;

    // Get or create business profile
    let businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!businessProfile) {
      throw createError('Business profile required. Please set up your business first.', 400);
    }

    const product = await prisma.product.create({
      data: {
        sellerId: businessProfile.id,
        title,
        description,
        price,
        stockQuantity: stockQuantity || 0,
        images: images || [],
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, stockQuantity, images, isActive } = req.body;

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      throw createError('Product not found', 404);
    }

    if (product.seller.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price,
        stockQuantity,
        images,
        isActive,
      },
    });

    res.json({ product: updatedProduct });
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!product) {
      throw createError('Product not found', 404);
    }

    if (product.seller.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getProductsBySeller = async (req: any, res: Response) => {
  try {
    const { sellerId } = req.params;

    const products = await prisma.product.findMany({
      where: { sellerId },
      include: {
        seller: true,
      },
    });

    res.json({ products });
  } catch (error) {
    throw error;
  }
};
