import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/uploadService';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        businessProfile: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: req.userId } }),
      prisma.follow.count({ where: { followerId: req.userId } }),
    ]);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
        businessProfile: user.businessProfile,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, address, city, state, country, bio, avatarUrl, backgroundUrl } = req.body;

    // Enforce a 180-day cooldown between profile edits for non-admin users.
    const existing = await prisma.profile.findUnique({
      where: { userId: req.userId! },
    });

    const PROFILE_COOLDOWN_DAYS = 180;
    const now = new Date();
    const lastUpdate = existing?.lastProfileUpdate;
    const isAdmin = req.userRole === 'ADMIN';

    if (
      !isAdmin &&
      lastUpdate &&
      now.getTime() - new Date(lastUpdate).getTime() < PROFILE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    ) {
      const nextAllowed = new Date(
        new Date(lastUpdate).getTime() + PROFILE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      );
      throw createError(
        `Profile can only be updated once every ${PROFILE_COOLDOWN_DAYS} days. Next update allowed on ${nextAllowed.toISOString().slice(0, 10)}.`,
        429
      );
    }

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      update: {
        fullName,
        phone,
        address,
        city,
        state,
        country,
        bio,
        avatarUrl,
        backgroundUrl,
        lastProfileUpdate: now,
      },
      create: {
        userId: req.userId!,
        fullName: fullName || '',
        phone,
        address,
        city,
        state,
        country,
        bio,
        avatarUrl,
        backgroundUrl,
        lastProfileUpdate: now,
      },
    });

    res.json({ profile });
  } catch (error) {
    throw error;
  }
};

export const getPublicProfile = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        businessProfile: {
          include: {
            services: true,
            products: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Don't expose banned or deactivated user profiles
    if (user.accountStatus === 'BANNED' || user.accountStatus === 'DEACTIVATED') {
      throw createError('User not found', 404);
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    // Don't expose sensitive data
    const { passwordHash, ...publicUser } = user;

    res.json({
      user: publicUser,
      followersCount,
      followingCount,
    });
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await uploadToCloudinary(req.file, 'workers-choice/avatars');

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      update: { avatarUrl: result.secure_url },
      create: {
        userId: req.userId!,
        fullName: '',
        avatarUrl: result.secure_url,
      },
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      profile,
    });
  } catch (error) {
    throw error;
  }
};

export const uploadBackground = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await uploadToCloudinary(req.file, 'workers-choice/backgrounds');

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      update: { backgroundUrl: result.secure_url },
      create: {
        userId: req.userId!,
        fullName: '',
        backgroundUrl: result.secure_url,
      },
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      profile,
    });
  } catch (error) {
    throw error;
  }
};

export const uploadBusinessLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await uploadToCloudinary(req.file, 'workers-choice/logos');

    const businessProfile = await prisma.businessProfile.upsert({
      where: { userId: req.userId! },
      update: { logoUrl: result.secure_url },
      create: {
        userId: req.userId!,
        businessName: '',
        category: '',
        logoUrl: result.secure_url,
      },
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      businessProfile,
    });
  } catch (error) {
    throw error;
  }
};
