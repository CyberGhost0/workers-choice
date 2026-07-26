import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
} from '../controllers/service.controller';
import { authenticate, authorize, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { serviceSchema } from '../utils/validations';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/provider/:providerId', getServicesByProvider);

// Protected routes (Artisans only)
router.post('/', authenticate, authorize('ARTISAN'), requireActiveStatus, validate(serviceSchema), createService);
router.put('/:id', authenticate, authorize('ARTISAN'), requireActiveStatus, updateService);
router.delete('/:id', authenticate, authorize('ARTISAN'), requireActiveStatus, deleteService);

export default router;
