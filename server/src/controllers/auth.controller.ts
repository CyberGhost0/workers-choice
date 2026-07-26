import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { signToken } from '../config/jwt';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, fullName, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || 'CUSTOMER',
        profile: {
          create: {
            fullName,
            phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate JWT
    const token = signToken({ userId: user.id, role: user.role, accountStatus: user.accountStatus }, '7d');

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, fullName).catch((err) => {
      console.warn('Failed to send welcome email:', err);
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    // If 2FA is enabled, issue a short-lived temp token (5 min) instead of full JWT.
    // The client must then call /auth/2fa/verify-login with a TOTP code to complete login.
    if (user.twoFactorEnabled) {
      const tempToken = signToken({ userId: user.id, role: user.role, accountStatus: user.accountStatus, temp: true }, '5m');
      return res.json({
        requiresTwoFactor: true,
        tempToken,
        email: user.email,
      });
    }

    // Generate JWT
    const token = signToken({ userId: user.id, role: user.role, accountStatus: user.accountStatus }, '7d');

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    throw error;
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        businessProfile: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
        businessProfile: user.businessProfile,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Invalidate any existing reset tokens for this user
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database (never store plaintext)
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    // Get the base URL for the reset link
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    // Send reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken, baseUrl);

    if (!emailSent) {
      // If email fails, still return success to prevent information leakage
      console.warn(`Failed to send reset email to ${user.email}`);
    }

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw createError('Token and password are required', 400);
    }

    // Hash the token to match what's stored in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find the reset token using the hash
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    // Validate token
    if (!resetRecord) {
      throw createError('Invalid or expired reset token', 400);
    }

    if (resetRecord.used) {
      throw createError('Reset token has already been used', 400);
    }

    if (new Date() > resetRecord.expiresAt) {
      throw createError('Reset token has expired', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    throw error;
  }
};
