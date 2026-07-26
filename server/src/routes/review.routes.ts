import { Router } from 'express';
import {
  createReview,
  getReviewsForUser,
  getReviewsByUser,
  getReviewsForOrder,
} from '../controllers/review.controller';
import { authenticate, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema } from '../utils/validations';

const router = Router();

// Public routes
router.get('/user/:userId', getReviewsForUser);
router.get('/order/:orderId', getReviewsForOrder);

// Protected routes
router.post('/', authenticate, requireActiveStatus, validate(reviewSchema), createReview);
router.get('/my-reviews', authenticate, getReviewsByUser);

export default router;
