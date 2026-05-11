import { ActivityStatus } from '../db/prisma';

/** Request body for PATCH /activities/:activityId/schedules/:scheduleId/status. */
export interface UpdateScheduleStatusBody {
  status: ActivityStatus;
}

/** Returned by PATCH /activities/:activityId/schedules/:scheduleId/status. */
export interface UpdateScheduleStatusDto {
  scheduleId: string;
  activityName: string;
  startAt: Date;
  endAt: Date | null;
  status: ActivityStatus;
  message: string;
}
