import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getPlatformStats,
  updatePlatformSettings,
  suspendUser,
  unsuspendUser,
  banUser,
  deactivateUser,
  deleteUser,
  getModerationLog,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// Moderation
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

// Moderation log
router.get('/moderation-log', getModerationLog);

// Platform stats
router.get('/stats', getPlatformStats);

// Platform settings
router.put('/settings', updatePlatformSettings);

export default router;
