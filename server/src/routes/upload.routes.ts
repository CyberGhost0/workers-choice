import { Router } from 'express';
import { uploadImage, uploadMultipleImages, uploadVideo } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../services/uploadService';

const router = Router();

// Protected routes
router.post('/image', authenticate, upload.single('file'), uploadImage);
router.post('/images', authenticate, upload.array('files', 10), uploadMultipleImages);
router.post('/video', authenticate, upload.single('file'), uploadVideo);

export default router;
