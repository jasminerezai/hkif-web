import { asyncHandler } from './asyncHandler';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { prisma, ProfileRole } from '../db/prisma';

// ──────────────────────────────────────────────
// Privilege hierarchy (ascending)
// USER < LEADER < BOARD_MEMBER < ADMIN
// ──────────────────────────────────────────────

const ROLE_RANK: Record<ProfileRole, number> = {
  USER: 0,
  LEADER: 1,
  BOARD_MEMBER: 2,
  ADMIN: 3,
};

/**
 * Verifies the Bearer JWT, confirms the user still exists in the DB,
 * and attaches { id, role } to req.user.
 *
 * DB lookup is intentional — it catches tokens belonging to deleted or
 * suspended accounts within the 7-day token window.
 */
export const authMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }

  const token = header.split(' ')[1]!;
  const decoded = verifyToken(token); // throws on invalid / expired

  const currentUser = await prisma.profile.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true },
  });

  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  req.user = { id: currentUser.id, role: currentUser.role };
  next();
});

/**
 * Exact role guard — only the listed roles are permitted.
 * Use for role-specific endpoints regardless of hierarchy.
 *
 * @example
 * router.delete('/users/:id', authMiddleware, restrictTo('ADMIN'), deleteUser);
 */
export const restrictTo = (...roles: ProfileRole[]) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role as ProfileRole)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  });

/**
 * Hierarchical role guard — the given role AND everything above it is permitted.
 * Use when privilege is cumulative (most protected routes).
 *
 * @example
 * router.post('/activities', authMiddleware, restrictToMinRole('LEADER'), createActivity);
 */
export const restrictToMinRole = (minRole: ProfileRole) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user || ROLE_RANK[req.user.role as ProfileRole]! < ROLE_RANK[minRole]!) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  });
