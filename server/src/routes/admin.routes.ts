import { Router } from 'express';
import { controller as adminController } from '../controllers/admin.controller.js';
import { authMiddleware, restrictToMinRole } from '../middleware/auth.js';
import { ProfileRole } from '../db/prisma.js';

const adminRoutes = Router();

// GET /api/admin/statistics — returns aggregate statistics for admin dashboard
adminRoutes.get(
  '/statistics',
  authMiddleware,
  restrictToMinRole(ProfileRole.ADMIN),
  adminController.getStatistics
);

export default adminRoutes;
