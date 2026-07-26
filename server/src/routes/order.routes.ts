import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getProviderOrders,
  updateOrderStatus,
  confirmOrderCompletion,
} from '../controllers/order.controller';
import { authenticate, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderSchema, orderStatusSchema } from '../utils/validations';

const router = Router();

// Protected routes
router.post('/', authenticate, requireActiveStatus, validate(orderSchema), createOrder);
router.get('/:id', authenticate, getOrderById);
router.get('/customer/orders', authenticate, getCustomerOrders);
router.get('/provider/orders', authenticate, getProviderOrders);
router.put('/:id/status', authenticate, requireActiveStatus, validate(orderStatusSchema), updateOrderStatus);
router.post('/:id/confirm', authenticate, requireActiveStatus, confirmOrderCompletion);

export default router;
