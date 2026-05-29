// server/src/cron/scheduleGenerator.ts
//
// Core logic for generating Schedule rows for the coming weeks.
// Called by the cron job every Monday at 00:05, and once on
// server startup to pre-populate the next 16 weeks (~4 months).

import { prisma, ActivityStatus } from '../db/prisma.js';
import { Prisma } from '../generated/prisma/index.js';
import { nextWeek, startAndEndOfWeek } from '../utils/weekCalculator.js';

const weekdayMap: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
};

// startDay is always Monday — nextDateForWeekday is safe here
// because (target - 1 + 7) % 7 gives the correct in-week offset.
function nextDateForWeekday(base: Date, weekday: string): Date {
    const target = weekdayMap[weekday]!;
    const date = new Date(base);
    const diff = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);
    return date;
}

// normalizes a date for reliable deduplication, zeroing seconds and milliseconds
function getDeduplicationKey(activityId: string, date: Date): string {
    const normalized = new Date(date);
    normalized.setUTCSeconds(0, 0);
    return `${activityId}|${normalized.getTime()}`;
}

// generateWeeklySchedules
// Generates Schedule rows for one or more upcoming weeks.
//
// weeksAhead: how many weeks to generate (default 1 for cron, 16 for startup)
// Reduces all DB work to 2 queries total regardless of dataset size:
//   1. Fetch all active activities + slots
//   2. Fetch all existing schedules in range
//   3. Batch insert only missing rows with createMany
export async function generateWeeklySchedules(weeksAhead: number = 1): Promise<void> {
    const now = new Date();

    // 1. Fetch all active activity templates with their time slots
    const activities = await prisma.activityTemplate.findMany({
        where: { defaultStatus: ActivityStatus.ACTIVE },
        include: { timeSlots: true },
    });

    // 2. Compute the full date range we're about to generate
    const rangeStart = startAndEndOfWeek(nextWeek(now, 1)).startDay;
    // Calculate rangeEnd directly based on weeksAhead * 7 days to avoid any DST, timezone, or day-of-week calculation errors.
    // Sunday end is Monday 00:00:00 + (weeksAhead * 7 days) - 1 ms.
    const rangeEnd = new Date(rangeStart.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000 - 1);

    // Validate the date range spans exactly weeksAhead * 7 days
    const diffDays = Math.round((rangeEnd.getTime() - rangeStart.getTime() + 1) / (24 * 60 * 60 * 1000));
    if (diffDays !== weeksAhead * 7) {
        console.error(`[cron] Warning: Date range calculation mismatch. Expected ${weeksAhead * 7} days, got ${diffDays}`);
    }

    console.log(`[cron] Generating schedules from ${rangeStart.toDateString()} to ${rangeEnd.toDateString()}...`);

    // 3. Fetch all existing schedule rows in range once — O(1) lookup via Set
    const existing = await prisma.schedule.findMany({
        where: { startAt: { gte: rangeStart, lte: rangeEnd } },
        select: { activityId: true, startAt: true },
    });
    const existingSet = new Set(
        existing.map(s => getDeduplicationKey(s.activityId, s.startAt))
    );

    // 4. Build the full list of rows to insert
    const toCreate: Prisma.ScheduleCreateManyInput[] = [];

    for (let week = 1; week <= weeksAhead; week++) {
        const { startDay } = startAndEndOfWeek(nextWeek(now, week));

        for (const activity of activities) {
            for (const slot of activity.timeSlots) {

                // startDay is always Monday — safe to use nextDateForWeekday
                const slotDate = nextDateForWeekday(startDay, slot.weekday);

                const startAt = new Date(slotDate);
                startAt.setUTCHours(
                    slot.startTime.getUTCHours(),
                    slot.startTime.getUTCMinutes(),
                    0, 0,
                );

                const endAt = new Date(slotDate);
                endAt.setUTCHours(
                    slot.endTime.getUTCHours(),
                    slot.endTime.getUTCMinutes(),
                    0, 0,
                );

                if (existingSet.has(getDeduplicationKey(activity.id, startAt))) continue;

                toCreate.push({
                    activityId: activity.id,
                    startAt,
                    endAt,
                    status: ActivityStatus.ACTIVE,
                });
            }
        }
    }

    // 5. Batch insert all missing rows in one query
    await prisma.schedule.createMany({ data: toCreate, skipDuplicates: true });

    console.log(`[cron] Done — ${toCreate.length} schedules created, ${existing.length} already existed.`);
}