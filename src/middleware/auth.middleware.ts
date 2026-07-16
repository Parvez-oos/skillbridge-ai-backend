import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User, IUser } from '../features/user/user.model';
import { RequestUser } from '../types/shared';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token.length === 0) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      sendError(res, 'Invalid token payload.', 401);
      return;
    }
    
    const user = await User.findById(decoded.userId).select('-password').lean();
    
    if (!user) {
      sendError(res, 'Invalid token. User not found.', 401);
      return;
    }
    
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      sendError(res, 'Token expired.', 401);
      return;
    }
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      sendError(res, 'Invalid token.', 401);
      return;
    }
    sendError(res, 'Authentication failed.', 401);
  }
};
