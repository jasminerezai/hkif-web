import { Router } from 'express';
import { registerHandler, loginHandler, getMeHandler } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

/**
 * GET /api/auth/me — returns the authenticated user.
 *
 * NOTE (future optimisation): `protect` does a DB lookup on every request
 * (prisma.profile.findUnique) to confirm the user still exists. For MVP this
 * is acceptable. Future improvement: cache the profile in Redis or trust the
 * JWT payload for non-sensitive reads.
 */
router.get('/me', authMiddleware, getMeHandler);

export default router;
