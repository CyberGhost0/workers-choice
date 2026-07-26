import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PLATFORM_FEE_PERCENT = 10;

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        provider: {
          include: { user: true },
        },
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    if (order.customerId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    if (order.status !== 'PENDING') {
      throw createError('Order is not in pending status', 400);
    }

    // Create payment intent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      capture_method: 'manual',
      metadata: {
        orderId: order.id,
        customerId: order.customerId,
        providerId: order.providerId,
      },
    });

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: order.totalAmount,
      platformFee: order.platformFee,
    });
  } catch (error) {
    throw error;
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    if (order.customerId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    if (!order.stripePaymentIntentId) {
      throw createError('No payment intent found', 400);
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      order.stripePaymentIntentId
    );

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'ACCEPTED' },
    });

    res.json({
      message: 'Payment captured successfully',
      status: paymentIntent.status,
    });
  } catch (error) {
    throw error;
  }
};

export const createProviderAccount = async (req: AuthRequest, res: Response) => {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: { interval: 'manual' },
        },
      },
      metadata: {
        userId: user.id,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL}/provider/onboarding/refresh`,
      return_url: `${process.env.APP_URL}/provider/onboarding/complete`,
      type: 'account_onboarding',
    });

    // Update business profile with Stripe account ID
    await prisma.businessProfile.update({
      where: { userId: req.userId },
      data: { stripeAccountId: account.id },
    });

    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    throw error;
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature']!;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        // Update order status to cancelled
        if (failedPayment.metadata.orderId) {
          await prisma.order.update({
            where: { id: failedPayment.metadata.orderId },
            data: { status: 'CANCELLED' },
          });
        }
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        // Update business profile
        await prisma.businessProfile.updateMany({
          where: { stripeAccountId: account.id },
          data: {
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
          },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        provider: {
          include: { user: true },
        },
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    if (order.customerId !== req.userId && order.provider.userId !== req.userId) {
      throw createError('Not authorized', 403);
    }

    let paymentStatus = null;
    if (order.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );
      paymentStatus = {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    }

    res.json({
      orderId: order.id,
      orderStatus: order.status,
      paymentStatus,
      customerConfirmed: order.customerConfirmed,
      providerConfirmed: order.providerConfirmed,
    });
  } catch (error) {
    throw error;
  }
};
