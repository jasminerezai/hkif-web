import { Router } from 'express';
import { updateScheduleStatusHandler } from '../controllers/activities.controller';
import { authMiddleware, restrictToMinRole } from '../middleware/auth';

const router = Router();

/**
 * PATCH /api/activities/:activityId/schedules/:scheduleId/status
 *
 * Updates a single schedule's status to any valid ActivityStatus:
 *   ACTIVE | CANCELLED | DELAYED | INACTIVE
 *
 * Body: { status: ActivityStatus }
 *
 * LEADER must own the activity via LeaderActivity
 * BOARD_MEMBER / ADMIN can update any activity's schedules
 */
router.patch(
  '/:activityId/schedules/:scheduleId/status',
  authMiddleware,
  restrictToMinRole('LEADER'),
  updateScheduleStatusHandler,
);

export default router;
