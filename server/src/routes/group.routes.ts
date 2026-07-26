import { Router } from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  getJoinRequests,
  handleJoinRequest,
  getGroupMembers,
  suspendGroupMember,
  unsuspendGroupMember,
  removeGroupMember,
  reportGroupMember,
  getGroupReports,
  resolveReport,
} from '../controllers/group.controller';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Middleware to check if user is a group admin (or global admin)
const authorizeGroupAdmin = (req: AuthRequest, res: any, next: any) => {
  const groupId = req.params.groupId || req.params.id;
  if (!req.userId) return res.status(401).json({ error: 'Authentication required' });

  // Global admins can manage any group
  if (req.userRole === 'ADMIN') return next();

  // Check if user is a group admin
  prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.userId } },
  }).then((member) => {
    if (member && member.role === 'admin') return next();
    return res.status(403).json({ error: 'Insufficient permissions' });
  }).catch(() => res.status(500).json({ error: 'Server error' }));
};

// Public routes
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.get('/:id/members', getGroupMembers);

// Protected routes
router.post('/', authenticate, authorize('ADMIN'), createGroup);
router.put('/:id', authenticate, authorize('ADMIN'), updateGroup);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteGroup);

// Join group
router.post('/:id/join', authenticate, joinGroup);

// Admin: Manage join requests
router.get('/requests/all', authenticate, authorize('ADMIN'), getJoinRequests);
router.put('/requests/:requestId', authenticate, authorize('ADMIN'), handleJoinRequest);

// Group member management (group admins + global admins)
router.put('/:groupId/members/:userId/suspend', authenticate, authorizeGroupAdmin, suspendGroupMember);
router.put('/:groupId/members/:userId/unsuspend', authenticate, authorizeGroupAdmin, unsuspendGroupMember);
router.put('/:groupId/members/:userId/remove', authenticate, authorizeGroupAdmin, removeGroupMember);
router.post('/:groupId/members/:userId/report', authenticate, reportGroupMember);

// Reports management
router.get('/:groupId/reports', authenticate, authorizeGroupAdmin, getGroupReports);
router.put('/reports/:reportId', authenticate, authorizeGroupAdmin, resolveReport);

export default router;
