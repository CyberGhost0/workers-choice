import { Request, Response, NextFunction } from 'express';

export const httpsEnforcement = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development or if secure mode is disabled
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Skip if secure mode is explicitly disabled
  if (process.env.SECURE_MODE === 'false') {
    return next();
  }

  // Check if request is already HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Redirect to HTTPS
  const httpsUrl = `https://${req.headers.host}${req.url}`;
  res.redirect(301, httpsUrl);
};
