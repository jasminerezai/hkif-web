import { Weekday, ActivityStatus } from '../db/prisma.js';

export type Activity = {
  name: string,
  location: string,
  leaders: string[],
  description?: string | null,
  notes?: string | null,
  maxCapacity?: number | null,
  defaultStatus?: ActivityStatus,
  timeSlots: TimeSlot[],
};

export interface ActivityDto extends Omit<Activity, 'timeSlots' | 'leaders'> {
  leaders: {
    profileId: string;
    activityId: string;
  }[];
  timeSlots: {
    id: string;
    activityId: string;
    weekday: Weekday;
    startTime: Date;
    endTime: Date;
  }[];
}

export type TimeSlot = {
  weekday: Weekday,
  startAt: string,
  endAt: string,
};

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
