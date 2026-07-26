import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  accountStatus?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.accountStatus = decoded.accountStatus;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireActiveStatus = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.accountStatus && req.accountStatus !== 'ACTIVE') {
    return res.status(403).json({
      error: 'Your account has been restricted. You cannot perform this action.',
      accountStatus: req.accountStatus,
    });
  }
  next();
};
