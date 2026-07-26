import { Router } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} from '../controllers/follow.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Follow a user
router.post('/:userId', followUser);

// Unfollow a user
router.delete('/:userId', unfollowUser);

// Get followers of a user
router.get('/:userId/followers', getFollowers);

// Get users a user is following
router.get('/:userId/following', getFollowing);

// Check follow status
router.get('/:userId/status', checkFollowStatus);

export default router;
