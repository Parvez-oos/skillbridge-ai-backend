import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Access denied. Not authenticated.', 401);
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Access denied. Insufficient permissions.', 403);
      return;
    }
    
    next();
  };
};
