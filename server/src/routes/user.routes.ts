import { Router } from 'express';
import { getProfile, updateProfile, getPublicProfile, uploadAvatar, uploadBackground, uploadBusinessLogo } from '../controllers/user.controller';
import { authenticate, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { profileSchema } from '../utils/validations';
import { upload } from '../services/uploadService';

const router = Router();

// Public routes
router.get('/:id', getPublicProfile);

// Protected routes
router.get('/', authenticate, getProfile);
router.put('/', authenticate, requireActiveStatus, validate(profileSchema), updateProfile);
router.post('/avatar', authenticate, requireActiveStatus, upload.single('file'), uploadAvatar);
router.post('/background', authenticate, requireActiveStatus, upload.single('file'), uploadBackground);
router.post('/business-logo', authenticate, requireActiveStatus, upload.single('file'), uploadBusinessLogo);

export default router;
