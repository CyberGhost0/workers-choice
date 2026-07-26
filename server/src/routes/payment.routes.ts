import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  createProviderAccount,
  handleWebhook,
  getPaymentStatus,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import express from 'express';

const router = Router();

// Stripe webhook (must be before other routes and use raw body)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes
router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm/:orderId', authenticate, confirmPayment);
router.post('/provider/onboarding', authenticate, createProviderAccount);
router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;
