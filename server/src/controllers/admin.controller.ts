import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalArtisans,
      totalCustomers,
      totalSellers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'COMPLETED' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalArtisans,
        totalCustomers,
        totalSellers,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        newUsersThisWeek,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', role, status, search, accountStatus } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.emailVerified = status === 'verified';
    if (accountStatus) where.accountStatus = accountStatus;
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { profile: { fullName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true, businessProfile: true },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        emailVerified: u.emailVerified,
        accountStatus: u.accountStatus,
        suspendedAt: u.suspendedAt,
        suspensionReason: u.suspensionReason,
        suspendedUntil: u.suspendedUntil,
        bannedAt: u.bannedAt,
        banReason: u.banReason,
        deactivatedAt: u.deactivatedAt,
        createdAt: u.createdAt,
        profile: u.profile,
        businessProfile: u.businessProfile,
      })),
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    throw error;
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { emailVerified } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    // Prevent admin from modifying themselves
    if (user.id === req.userId) {
      throw createError('Cannot modify your own account status', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { emailVerified },
      include: { profile: true },
    });

    res.json({
      message: 'User status updated',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['CUSTOMER', 'ARTISAN', 'SELLER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw createError('Invalid role', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    // Prevent admin from demoting themselves
    if (user.id === req.userId && role !== 'ADMIN') {
      throw createError('Cannot change your own admin role', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: { profile: true },
    });

    res.json({
      message: 'User role updated',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalServices,
      totalProducts,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.service.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalServices,
        totalProducts,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const updatePlatformSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { platformFee, maintenanceMode, secureMode } = req.body;

    // Store settings in environment or database
    // For now, just return success
    res.json({
      message: 'Platform settings updated',
      settings: {
        platformFee,
        maintenanceMode,
        secureMode,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, durationDays } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id === req.userId) {
      throw createError('Cannot suspend yourself', 400);
    }

    const suspendedUntil = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: reason || null,
        suspendedUntil,
      },
    });

    await prisma.moderationAction.create({
      data: {
        actionType: 'SUSPEND',
        targetUserId: id,
        performedById: req.userId!,
        reason: reason || null,
      },
    });

    res.json({
      message: 'User suspended successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
        suspensionReason: updatedUser.suspensionReason,
        suspendedUntil: updatedUser.suspendedUntil,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const unsuspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id === req.userId) {
      throw createError('Cannot unsuspend yourself', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'ACTIVE',
        suspendedAt: null,
        suspensionReason: null,
        suspendedUntil: null,
      },
    });

    await prisma.moderationAction.create({
      data: {
        actionType: 'UNSUSPEND',
        targetUserId: id,
        performedById: req.userId!,
        reason: 'User unsuspended',
      },
    });

    res.json({
      message: 'User unsuspended successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id === req.userId) {
      throw createError('Cannot ban yourself', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'BANNED',
        bannedAt: new Date(),
        banReason: reason || null,
        suspendedAt: null,
        suspensionReason: null,
        suspendedUntil: null,
      },
    });

    await prisma.moderationAction.create({
      data: {
        actionType: 'BAN',
        targetUserId: id,
        performedById: req.userId!,
        reason: reason || null,
      },
    });

    res.json({
      message: 'User banned permanently',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
        banReason: updatedUser.banReason,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id === req.userId) {
      throw createError('Cannot deactivate yourself', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'DEACTIVATED',
        deactivatedAt: new Date(),
      },
    });

    await prisma.moderationAction.create({
      data: {
        actionType: 'DEACTIVATE',
        targetUserId: id,
        performedById: req.userId!,
        reason: reason || null,
      },
    });

    res.json({
      message: 'User deactivated',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id === req.userId) {
      throw createError('Cannot delete yourself', 400);
    }

    await prisma.user.delete({ where: { id } });

    await prisma.moderationAction.create({
      data: {
        actionType: 'DELETE',
        targetUserId: id,
        performedById: req.userId!,
        reason: 'Account deleted by admin',
      },
    });

    res.json({ message: 'User deleted permanently' });
  } catch (error) {
    throw error;
  }
};

export const getModerationLog = async (req: AuthRequest, res: Response) => {
  try {
    const actions = await prisma.moderationAction.findMany({
      include: {
        targetUser: { include: { profile: true } },
        performedBy: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      actions: actions.map((a) => ({
        id: a.id,
        actionType: a.actionType,
        reason: a.reason,
        createdAt: a.createdAt,
        targetUser: {
          id: a.targetUser.id,
          email: a.targetUser.email,
          name: a.targetUser.profile?.fullName,
        },
        performedBy: {
          id: a.performedBy.id,
          email: a.performedBy.email,
          name: a.performedBy.profile?.fullName,
        },
      })),
    });
  } catch (error) {
    throw error;
  }
};
