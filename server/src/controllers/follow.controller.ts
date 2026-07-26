import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (followerId === userId) {
      throw createError('Cannot follow yourself', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId!,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      throw createError('Already following this user', 400);
    }

    await prisma.follow.create({
      data: {
        followerId: followerId!,
        followingId: userId,
      },
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    throw error;
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId!,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      throw createError('Not following this user', 400);
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: followerId!,
          followingId: userId,
        },
      },
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          include: {
            profile: true,
            businessProfile: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.follow.count({
      where: { followingId: userId },
    });

    res.json({
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: {
            profile: true,
            businessProfile: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.follow.count({
      where: { followerId: userId },
    });

    res.json({
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const checkFollowStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId!,
          followingId: userId,
        },
      },
    });

    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    res.json({
      isFollowing: !!follow,
      followersCount,
      followingCount,
    });
  } catch (error) {
    throw error;
  }
};
