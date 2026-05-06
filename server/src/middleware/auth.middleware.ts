import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../db/prisma';
import { asyncHandler } from './asyncHandler';

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  // 1. Get token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('You are not logged in! Please log in to get access.');
  }

  // 2. Verify token — verifyToken throws on invalid/expired; asyncHandler forwards it
  const decoded = verifyToken(token);

  // 3. Check if user still exists
  const currentUser = await prisma.profile.findUnique({
    where: { id: decoded.id },
    select: { id: true, profileName: true, email: true, role: true },
  });

  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  // 4. Grant access to protected route
  req.user = {
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.profileName,
    role: currentUser.role,
  };

  next();
});

/**
 * Restricts access to users with one of the specified roles.
 * MUST be used after `protect` — relies on req.user being set.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};
