import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { prisma, ProfileRole, ActivityStatus } from '../db/prisma';
import { ApiResponse, UpdateScheduleStatusBody, UpdateScheduleStatusDto } from '../types';

// ──────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────

/**
 * Confirms the activity exists and, for LEADER role, that the
 * requester is listed as a leader for it.
 * BOARD_MEMBER and ADMIN skip the ownership check.
 *
 * Throws ApiError (404 / 403) if either check fails.
 * Returns the activity record on success.
 */
async function assertActivityAccess(
  activityId: string,
  requesterId: string,
  role: ProfileRole,
) {
  const activity = await prisma.activityTemplate.findUnique({
    where: { id: activityId },
    select: { id: true, name: true },
  });

  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }

  if (role === ProfileRole.LEADER) {
    const ownership = await prisma.leaderActivity.findUnique({
      where: {
        profileId_activityId: { profileId: requesterId, activityId },
      },
    });

    if (!ownership) {
      throw ApiError.forbidden('You are not the leader of this activity');
    }
  }

  return activity;
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/activities/:activityId/schedules/:scheduleId/status
 *
 * Updates the status of a single schedule to any valid ActivityStatus:
 *   ACTIVE | CANCELLED | DELAYED | INACTIVE
 *
 * Covers cancellation, delays, and re-activation in one endpoint.
 * Body: { status: ActivityStatus }
 *
 * Auth:
 *   LEADER      → must own the activity via LeaderActivity
 *   BOARD_MEMBER / ADMIN → can update any activity's schedules
 */
export const updateScheduleStatusHandler = asyncHandler(async (
  req: Request<{ activityId: string; scheduleId: string }, any, UpdateScheduleStatusBody>,
  res: Response<ApiResponse<UpdateScheduleStatusDto>>,
) => {
  const { activityId, scheduleId } = req.params;
  const { id: requesterId, role }  = req.user!;
  const { status }                 = req.body;

  // ── 1. Validate the incoming status value ────────────────────
  const validStatuses = Object.values(ActivityStatus) as string[];
  if (!status || !validStatuses.includes(status)) {
    throw ApiError.badRequest(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    );
  }

  // ── 2. Activity existence + ownership ────────────────────────
  const activity = await assertActivityAccess(activityId, requesterId, role);

  // ── 3. Confirm schedule exists and belongs to this activity ──
  const schedule = await prisma.schedule.findUnique({
    where:  { id: scheduleId },
    select: { id: true, activityId: true, startAt: true, endAt: true, status: true },
  });

  if (!schedule) {
    throw ApiError.notFound('Schedule not found');
  }

  if (schedule.activityId !== activityId) {
    throw ApiError.forbidden('This schedule does not belong to the specified activity');
  }

  // ── 4. Apply the status update ───────────────────────────────
  const updated = await prisma.schedule.update({
    where:  { id: scheduleId },
    data:   { status },
    select: { id: true, startAt: true, endAt: true, status: true },
  });

  const statusMessages: Record<ActivityStatus, string> = {
    [ActivityStatus.CANCELLED]: 'Schedule cancelled. Registered participants will see the cancellation on their next refresh.',
    [ActivityStatus.DELAYED]:   'Schedule marked as delayed. Registered participants will see the update on their next refresh.',
    [ActivityStatus.ACTIVE]:    'Schedule is now active.',
    [ActivityStatus.INACTIVE]:  'Schedule is now inactive.',
  };

  res.status(200).json({
    status: 'success',
    data: {
      scheduleId:   updated.id,
      activityName: activity.name,
      startAt:      updated.startAt,
      endAt:        updated.endAt,
      status:       updated.status,
      message:      statusMessages[updated.status],
    },
  });
});
