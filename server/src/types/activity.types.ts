import { Weekday, ActivityStatus } from '../db/prisma';

export type Activity = {
    name: string,
    location: string,
    leaders: string[],
    description?: string | null,
    notes?: string | null,
    maxCapacity?: number,
    defaultStatus?: ActivityStatus,
    timeSlots: TimeSlot[],
};

export type TimeSlot = {
    weekday: Weekday,
    startAt: string,
    endAt: string,
};
