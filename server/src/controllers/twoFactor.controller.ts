import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { signToken, verifyToken } from '../config/jwt';

// Generate a 2FA secret and return it with a QR code data URL
export const setup2FA = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw createError('2FA is already enabled. Disable it first to reconfigure.', 400);
    }

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({ length: 20, name: `WorkersChoice:${user.email}` });
    const otpauthUrl = secret.otpauth_url;

    // Generate QR code as a data URL
    const qrCode = await QRCode.toDataURL(otpauthUrl!);

    // Store the secret temporarily (will be confirmed on verify)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    res.json({
      secret: secret.base32,
      qrCode,
      label: `WorkersChoice:${user.email}`,
    });
  } catch (error) {
    throw error;
  }
};

// Verify a TOTP code and enable 2FA for the user
export const verifyAndEnable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError('Verification code is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorSecret) {
      throw createError('2FA setup not initiated. Call setup first.', 400);
    }

    if (user.twoFactorEnabled) {
      throw createError('2FA is already enabled.', 400);
    }

    // Verify the TOTP code against the stored secret
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      throw createError('Invalid verification code. Please try again.', 400);
    }

    // Enable 2FA (secret is already saved)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    res.json({ message: '2FA has been enabled successfully.' });
  } catch (error) {
    throw error;
  }
};

// Disable 2FA - requires password confirmation
export const disable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw createError('Password is required to disable 2FA.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw createError('2FA is not enabled.', 400);
    }

    // Verify password before disabling
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw createError('Invalid password.', 401);
    }

    // Disable 2FA and clear the secret
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    res.json({ message: '2FA has been disabled successfully.' });
  } catch (error) {
    throw error;
  }
};

// Complete 2FA verification during login (after password is verified)
export const verifyLogin2FA = async (req: Request, res: Response) => {
  try {
    const { tempToken, token } = req.body;

    if (!tempToken || !token) {
      throw createError('Temporary token and verification code are required.', 400);
    }

    // Verify the temporary token
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch {
      throw createError('Temporary token is invalid or expired.', 401);
    }

    const payload = decoded as { userId: string; role: string; temp?: boolean };
    if (!payload.temp) {
      throw createError('Invalid token type.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw createError('2FA is not enabled for this account.', 400);
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!isValid) {
      throw createError('Invalid verification code.', 401);
    }

    // Generate full JWT
    const jwt = signToken({ userId: user.id, role: user.role }, '7d');

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token: jwt,
    });
  } catch (error) {
    throw error;
  }
};

// Get 2FA status (whether enabled/disabled)
export const get2FAStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { twoFactorEnabled: true },
    });

    res.json({ enabled: user?.twoFactorEnabled ?? false });
  } catch (error) {
    throw error;
  }
};
