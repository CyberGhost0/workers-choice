import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}

export const getJwtSecret = (): string => {
  return JWT_SECRET;
};

export const signToken = (payload: { userId: string; role: string; accountStatus?: string; [key: string]: any }, expiresIn: string = '1h'): string => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): { userId: string; role: string; accountStatus?: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; accountStatus?: string };
};
