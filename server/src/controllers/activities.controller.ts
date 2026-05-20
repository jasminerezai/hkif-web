import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma, ProfileRole, ActivityStatus } from '../db/prisma.js';
import { ApiResponse, UpdateScheduleStatusBody, UpdateScheduleStatusDto, Activity, ActivityDto } from '../types/index.js';
import {
    CreateActivitySchema,
    DeleteActivitySchema,
    parseZodError,
    UpdateActivityGeneralSchema,
    UpdateActivityURLSchema,
    StatusValidationSchema,
    IdSchema,
    isUUID
} from "../validators/index.js";
import { DELETE, READ, UPDATE, CREATE } from "../db/queries.js";
import {ZodError} from "zod";

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
  let activityId: string;
  let scheduleId: string;
  let status: ActivityStatus;
  const { id: requesterId, role } = req.user!;
  try{
      activityId = IdSchema.parse(req.params.activityId);
      scheduleId = IdSchema.parse(req.params.scheduleId);
      status = StatusValidationSchema.parse(req.body);

  } catch (error){
      if( error instanceof ZodError) throw ApiError.badRequest(JSON.stringify(parseZodError(error)));
      else throw ApiError.internal(`Something went wrong: ${error}`)
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
      throw ApiError.badRequest(`Invalid request body: ${error}`);
    }

    // If no leaders provided, assign the creator as the leader
    if (!newActivity.leaders || newActivity.leaders.length === 0) {
      if (req.user?.id) {
        newActivity.leaders = [req.user!.id];
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
      if(error instanceof ZodError) throw ApiError.badRequest(`Invalid request body or params: ${parseZodError(error)}`);
      else throw ApiError.internal(`Something went wrong: ${error}`)
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
  res: Response<ApiResponse<{ participantCount: number }>>
) => {
  const { activityId, scheduleId } = req.params
  const profileId = req.user!.id

  if (!isUUID(activityId) || !isUUID(scheduleId)) {
    throw ApiError.badRequest('Invalid activityId or scheduleId format')
  }

  const participantCount = await CREATE.registerParticipation(profileId, scheduleId, activityId)

  res.status(201).json({ status: 'success', data: { participantCount } })
})

export const unregisterParticipation = asyncHandler(async (
  req: Request<{ activityId: string; scheduleId: string }>,
  res: Response<ApiResponse<{ participantCount: number }>>
) => {
  const { activityId, scheduleId } = req.params
  const profileId = req.user!.id

  if (!isUUID(activityId) || !isUUID(scheduleId)) {
    throw ApiError.badRequest('Invalid activityId or scheduleId format')
  }

  const existing = await READ.isParticipating(profileId, scheduleId)
  if (!existing) throw ApiError.notFound('Not registered for this activity')

  await DELETE.unregisterParticipation(profileId, scheduleId)
  const participantCount = await READ.participantCount(scheduleId)

  res.status(200).json({ status: 'success', data: { participantCount } })
})
