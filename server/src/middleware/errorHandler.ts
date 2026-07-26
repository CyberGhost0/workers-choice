import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;

  // Never leak error details - always return generic message
  if (err.isOperational) {
    return res.status(statusCode).json({
      error: err.message,
    });
  }

  // For unexpected errors, never expose internal details
  res.status(500).json({
    error: 'Internal Server Error',
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
