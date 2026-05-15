import { Router } from 'express';
import {
  updateScheduleStatusHandler,
  getActivities,
  newActivity,
  updateActivity,
  deleteActivity,
  registerParticipation,
  unregisterParticipation
} from '../controllers/activities.controller';
import { authMiddleware, restrictToMinRole } from '../middleware/auth';
import { ProfileRole } from "../db/prisma";

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
  restrictToMinRole(ProfileRole.LEADER),
  updateScheduleStatusHandler,
);

// GET /activities
router.get('', getActivities);

// POST /activities --- leader only --> create new activity
router.post(
  '',
  authMiddleware,
  restrictToMinRole(ProfileRole.LEADER),
  newActivity,
);

// PUT /activities/:activityId --- leader only --> update activity
router.put(
  '/:activityId',
  authMiddleware,
  restrictToMinRole(ProfileRole.LEADER),
  updateActivity
);

// DELETE /activities/:activityId --- leader only --> delete activity
router.delete(
  '/:activityId',
  authMiddleware,
  restrictToMinRole(ProfileRole.LEADER),
  deleteActivity
);

router.post(
  '/:activityId/schedules/:scheduleId/participate',
  authMiddleware,
  registerParticipation
)

router.delete(
  '/:activityId/schedules/:scheduleId/participate',
  authMiddleware,
  unregisterParticipation
)

export default router;
