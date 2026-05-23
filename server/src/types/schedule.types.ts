import { ActivityTemplate } from '../generated/prisma/index.js';
import { leaderDto } from "./profile.types.js";
import { ActivityStatus } from '../db/prisma.js';

export type ScheduleDto = {
    id: string,
    activityId: string,
    startAt: Date,
    endAt: Date | null,
    status: ActivityStatus,
    createdAt: Date,
    updatedAt: Date,
    activity: ActivityTemplate, // change to ActivityDto?? --> duplicate data leaders and timeSlots
    leaders: leaderDto[],
    participantCount: number,
};