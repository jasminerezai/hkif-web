import { Router } from 'express';
import { controller as profilesController } from '../controllers/profiles.controller.js';
import { authMiddleware, restrictToMinRole } from '../middleware/auth.js';
import { ProfileRole } from '../db/prisma.js';

const profilesRoutes = Router();

// For every route: check if the user is logged in and has at least LEADER role
profilesRoutes.use(authMiddleware);
profilesRoutes.use(restrictToMinRole(ProfileRole.LEADER));

profilesRoutes.get('/', profilesController.getProfiles);

export default profilesRoutes;
