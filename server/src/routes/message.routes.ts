import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
} from '../controllers/message.controller';
import { authenticate, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { messageSchema } from '../utils/validations';

const router = Router();

// Protected routes
router.post('/', authenticate, requireActiveStatus, validate(messageSchema), sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversation/:userId', authenticate, getConversationMessages);
router.put('/:id/read', authenticate, markAsRead);

export default router;
