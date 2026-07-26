import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
} from '../controllers/product.controller';
import { authenticate, authorize, requireActiveStatus } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { productSchema } from '../utils/validations';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/seller/:sellerId', getProductsBySeller);

// Protected routes (Sellers only)
router.post('/', authenticate, authorize('SELLER'), requireActiveStatus, validate(productSchema), createProduct);
router.put('/:id', authenticate, authorize('SELLER'), requireActiveStatus, updateProduct);
router.delete('/:id', authenticate, authorize('SELLER'), requireActiveStatus, deleteProduct);

export default router;
