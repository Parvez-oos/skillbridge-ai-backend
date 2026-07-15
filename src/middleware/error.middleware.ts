import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }
  
  if (err.name === 'ValidationError') {
    sendError(res, 'Validation error', 400);
    return;
  }
  
  if (err.name === 'CastError') {
    sendError(res, 'Invalid ID format', 400);
    return;
  }
  
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 'Duplicate field value', 409);
    return;
  }
  
  sendError(res, 'Internal server error', 500);
};
