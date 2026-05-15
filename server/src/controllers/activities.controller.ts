import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { prisma, ProfileRole, ActivityStatus } from '../db/prisma';
import { ApiResponse, UpdateScheduleStatusBody, UpdateScheduleStatusDto, Activity } from '../types';
import { CreateActivitySchema, DeleteActivitySchema, UpdateActivityGeneralSchema, UpdateActivityURLSchema } from "../validators";
import { DELETE, READ, UPDATE, CREATE } from "../db/queries";
import { ActivityDto } from "../types/activity.types";

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
  req: Request<{ activityId: string; scheduleId: string; }, any, UpdateScheduleStatusBody>,
  res: Response<ApiResponse<UpdateScheduleStatusDto>>,
) => {
  const { activityId, scheduleId } = req.params;
  const { id: requesterId, role } = req.user!;
  const { status } = req.body;

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
    where: { id: scheduleId },
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
    where: { id: scheduleId },
    data: { status },
    select: { id: true, startAt: true, endAt: true, status: true },
  });

  const statusMessages: Record<ActivityStatus, string> = {
    [ActivityStatus.CANCELLED]: 'Schedule cancelled. Registered participants will see the cancellation on their next refresh.',
    [ActivityStatus.DELAYED]: 'Schedule marked as delayed. Registered participants will see the update on their next refresh.',
    [ActivityStatus.ACTIVE]: 'Schedule is now active.',
    [ActivityStatus.INACTIVE]: 'Schedule is now inactive.',
  };

  res.status(200).json({
    status: 'success',
    data: {
      scheduleId: updated.id,
      activityName: activity.name,
      startAt: updated.startAt,
      endAt: updated.endAt,
      status: updated.status,
      message: statusMessages[updated.status],
    },
  });
});

export const newActivity = asyncHandler(
  async (req: Request<{}, {}, Activity>, res: Response<ApiResponse<ActivityDto>>) => {
    let newActivity: Activity;

    try {
      newActivity = CreateActivitySchema.parse(req.body);
    } catch (error) {
      console.error(error);
      throw ApiError.badRequest(`Invalid request body: ${error}`);
    }

    // If no leaders provided, assign the creator as the leader
    if (!newActivity.leaders || newActivity.leaders.length === 0) {
      if (req.user?.id) {
        newActivity.leaders = [req.user.id];
      }
    }

    const data = await CREATE.newActivity(newActivity);
    res.status(201).json({
      status: "success",
      data,
    });
  }
);

export const updateActivity = asyncHandler(
  async (req: Request<{ activityId: string; }, {}, Partial<Activity>>, res: Response<ApiResponse<ActivityDto>>) => {
    let updateParams: { activityId: string; };
    let updateBody: Partial<Activity>;

    try {
      updateParams = UpdateActivityURLSchema.parse(req.params);
      updateBody = UpdateActivityGeneralSchema.parse(req.body);
    } catch (error) {
      console.error(error);
      throw ApiError.badRequest(`Invalid request body or params: ${error}`);
    }

    // Check if activity exists before attempting update
    const existingActivity = await READ.activityById(updateParams.activityId);
    if (!existingActivity) {
      throw ApiError.notFound(`Activity with id ${updateParams.activityId} not found`);
    }

    let updatePayload: Partial<Activity> = {};

    // Only include fields that are present in the request body
    for (const field of Object.keys(updateBody)) {
      const key = field as keyof Activity;
      if (updateBody[key] !== undefined) {
        (updatePayload as Record<string, unknown>)[field] = updateBody[key];
      }
    }

    const updatedActivity = await UPDATE.updateActivity(updateParams.activityId, updatePayload);
    res.status(200).json({
      status: "success",
      data: updatedActivity!,
    });
  }
);

export const deleteActivity = asyncHandler(
  async (req: Request<{ activityId: string; }>, res: Response<ApiResponse<null>>) => {
    let deleteParams: { activityId: string; };
    try {
      deleteParams = DeleteActivitySchema.parse(req.params);
    } catch (error) {
      console.error(error);
      throw ApiError.badRequest(`Invalid request params: ${error}`);
    }

    // Check if activity exists before attempting deletion
    const existingActivity = await READ.activityById(deleteParams.activityId);
    if (!existingActivity) {
      throw ApiError.notFound(`Activity with id ${deleteParams.activityId} not found`);
    }

    await DELETE.deleteActivity(deleteParams.activityId);
    res.status(200).json({
      status: "success",
      data: null,
    });
  }
);

export const getActivities = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<ActivityDto[]>>) => {
    const data = await READ.allActivities();
    res.status(200).json({
      status: "success",
      data,
    });
  }
);


export const registerParticipation = asyncHandler(async (
  req: Request<{ activityId: string; scheduleId: string }>,
  res: Response
) => {
  const { activityId, scheduleId } = req.params
  const profileId = req.user!.id

  // Check schedule exists and belongs to this activity
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { activity: true }
  })
  if (!schedule) throw ApiError.notFound('Schedule not found')
  if (schedule.activityId !== activityId) throw ApiError.badRequest('Schedule does not belong to this activity')

  // Check capacity
  if (schedule.activity.maxCapacity !== null) {
    const count = await READ.participantCount(scheduleId)
    if (count >= schedule.activity.maxCapacity) {
      throw ApiError.conflict('Activity is full')
    }
  }

  // Check not already registered
  const existing = await READ.isParticipating(profileId, scheduleId)
  if (existing) throw ApiError.conflict('Already registered for this activity')

  await CREATE.registerParticipation(profileId, scheduleId)
  const participantCount = await READ.participantCount(scheduleId)

  res.status(201).json({ status: 'success', data: { participantCount } })
})

export const unregisterParticipation = asyncHandler(async (
  req: Request<{ activityId: string; scheduleId: string }>,
  res: Response
) => {
  const { scheduleId } = req.params
  const profileId = req.user!.id

  const existing = await READ.isParticipating(profileId, scheduleId)
  if (!existing) throw ApiError.notFound('Not registered for this activity')

  await DELETE.unregisterParticipation(profileId, scheduleId)
  const participantCount = await READ.participantCount(scheduleId)

  res.status(200).json({ status: 'success', data: { participantCount } })
})