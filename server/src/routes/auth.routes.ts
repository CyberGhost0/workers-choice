import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validations';
import {
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  verifyLogin2FA,
  get2FAStatus,
} from '../controllers/twoFactor.controller';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/2fa/verify-login', verifyLogin2FA);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verifyAndEnable2FA);
router.post('/2fa/disable', authenticate, disable2FA);
router.get('/2fa/status', authenticate, get2FAStatus);

export default router;
