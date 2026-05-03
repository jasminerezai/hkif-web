import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../db/prisma.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  // 1. Get token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
  }

  try {
    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Check if user still exists
    const currentUser = await prisma.profile.findUnique({
      where: { profile_id: decoded.id },
      select: { profile_id: true, profile_role: true }
    });

    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token does no longer exist.'));
    }

    // 4. Grant access to protected route
    req.user = {
      id: currentUser.profile_id,
      role: currentUser.profile_role,
    };
    
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token. Please log in again.'));
  }
});

// Optional: restrict to certain roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};
