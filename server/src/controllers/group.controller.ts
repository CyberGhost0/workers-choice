import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getGroups = async (req: any, res: Response) => {
  try {
    const { category, search } = req.query;

    const where: any = {
      status: 'active',
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const groups = await prisma.skillGroup.findMany({
      where,
      include: {
        _count: {
          select: { members: true, requests: { where: { status: 'PENDING' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ groups });
  } catch (error) {
    throw error;
  }
};

export const getGroupById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const group = await prisma.skillGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: { members: true, requests: { where: { status: 'PENDING' } } },
        },
      },
    });

    if (!group) {
      throw createError('Group not found', 404);
    }

    res.json({ group });
  } catch (error) {
    throw error;
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category } = req.body;

    const group = await prisma.skillGroup.create({
      data: {
        name,
        description,
        category,
        createdBy: req.userId!,
        memberCount: 0,
        pendingRequests: 0,
      },
    });

    res.status(201).json({ group });
  } catch (error) {
    throw error;
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, status } = req.body;

    const group = await prisma.skillGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw createError('Group not found', 404);
    }

    const updatedGroup = await prisma.skillGroup.update({
      where: { id },
      data: {
        name,
        description,
        category,
        status,
      },
    });

    res.json({ group: updatedGroup });
  } catch (error) {
    throw error;
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const group = await prisma.skillGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw createError('Group not found', 404);
    }

    await prisma.skillGroup.delete({
      where: { id },
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if group exists
    const group = await prisma.skillGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw createError('Group not found', 404);
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.userId!,
        },
      },
    });

    if (existingMember) {
      throw createError('You are already a member of this group', 400);
    }

    // Check if already has pending request
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        groupId: id,
        userId: req.userId!,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw createError('You already have a pending request for this group', 400);
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        groupId: id,
        userId: req.userId!,
        message,
      },
    });

    // Update pending requests count
    await prisma.skillGroup.update({
      where: { id },
      data: {
        pendingRequests: { increment: 1 },
      },
    });

    res.status(201).json({
      message: 'Join request submitted successfully',
      request: joinRequest,
    });
  } catch (error) {
    throw error;
  }
};

export const getJoinRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status, groupId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    const requests = await prisma.joinRequest.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
        group: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    throw error;
  }
};

export const handleJoinRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { group: true },
    });

    if (!request) {
      throw createError('Join request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw createError('Request has already been processed', 400);
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update request status
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedBy: req.userId,
        reviewedAt: new Date(),
      },
    });

    // If approved, add user to group
    if (action === 'approve') {
      await prisma.groupMember.create({
        data: {
          groupId: request.groupId,
          userId: request.userId,
        },
      });

      // Update member count and pending requests
      await prisma.skillGroup.update({
        where: { id: request.groupId },
        data: {
          memberCount: { increment: 1 },
          pendingRequests: { decrement: 1 },
        },
      });
    } else {
      // Just decrement pending requests
      await prisma.skillGroup.update({
        where: { id: request.groupId },
        data: {
          pendingRequests: { decrement: 1 },
        },
      });
    }

    res.json({
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    throw error;
  }
};

export const getGroupMembers = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const members = await prisma.groupMember.findMany({
      where: { groupId: id },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    res.json({ members });
  } catch (error) {
    throw error;
  }
};

export const suspendGroupMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, userId } = req.params;
    const { reason } = req.body;

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    const updatedMember = await prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: {
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason || null,
      },
    });

    res.json({ message: 'Member suspended', member: updatedMember });
  } catch (error) {
    throw error;
  }
};

export const unsuspendGroupMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    const updatedMember = await prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: {
        status: 'active',
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    res.json({ message: 'Member unsuspended', member: updatedMember });
  } catch (error) {
    throw error;
  }
};

export const removeGroupMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    await prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: {
        status: 'removed',
        removedAt: new Date(),
      },
    });

    await prisma.skillGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });

    res.json({ message: 'Member removed from group' });
  } catch (error) {
    throw error;
  }
};

export const reportGroupMember = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, userId } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      throw createError('Reason is required', 400);
    }

    const report = await prisma.memberReport.create({
      data: {
        groupId,
        reporterId: req.userId!,
        targetUserId: userId,
        reason,
        description: description || null,
      },
    });

    res.status(201).json({ message: 'Member reported', report });
  } catch (error) {
    throw error;
  }
};

export const getGroupReports = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    const where: any = { groupId };
    if (status) where.status = status;

    const reports = await prisma.memberReport.findMany({
      where,
      include: {
        reporter: { include: { profile: true } },
        targetUser: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  } catch (error) {
    throw error;
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // 'resolve' or 'dismiss'

    const report = await prisma.memberReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    const status = action === 'resolve' ? 'RESOLVED' : 'DISMISSED';

    const updatedReport = await prisma.memberReport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedBy: req.userId,
        resolvedAt: new Date(),
      },
    });

    res.json({ message: `Report ${status.toLowerCase()}`, report: updatedReport });
  } catch (error) {
    throw error;
  }
};
