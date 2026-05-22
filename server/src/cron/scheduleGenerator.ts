// server/src/cron/scheduleGenerator.ts
//
// Core logic for generating Schedule rows for the coming week.
// Called by the cron job every Monday at 00:01, and once on
// server startup as a fallback (in case the server was down on Monday).

import { prisma, ActivityStatus } from '../db/prisma.js';
import { nextWeek, startAndEndOfWeek } from '../utils/weekCalculator.js';

// weekdayMap 
// Maps our Weekday enum to JS Date.getDay() values (0 = Sunday)
const weekdayMap: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
};

// nextDateForWeekday
// Given a base date and a weekday, returns the next occurrence
// of that weekday on or after the base date.
// Reuses the same logic as seed.ts.
function nextDateForWeekday(base: Date, weekday: string): Date {
    const target = weekdayMap[weekday]!;
    const date = new Date(base);
    const diff = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);
    return date;
}

// generateWeeklySchedules
// Main export. Generates Schedule rows for the coming week.
//
// Steps:
//   1. Compute the date range for next week (Monday–Sunday)
//   2. Fetch all ACTIVE ActivityTemplates with their timeSlots
//   3. For each timeSlot, check if a schedule already exists in that range
//   4. If not, create one with status ACTIVE
//
// Safe to call multiple times — the existence check prevents duplicates.
export async function generateWeeklySchedules(): Promise<void> {
    const now = new Date();
    const nextMon = nextWeek(now, 1);              // base = one week ahead
    const { startDay, endDay } = startAndEndOfWeek(nextMon);

    console.log(`[cron] Generating schedules for ${startDay.toDateString()} – ${endDay.toDateString()}`);

    // 1. Fetch all active activity templates with their time slots
    const activities = await prisma.activityTemplate.findMany({
        where: { defaultStatus: ActivityStatus.ACTIVE },
        include: { timeSlots: true },
    });

    let created = 0;
    let skipped = 0;

    for (const activity of activities) {
        for (const slot of activity.timeSlots) {

            // 2. Compute the exact date for this slot next week
            const slotDate = nextDateForWeekday(startDay, slot.weekday);

            const startAt = new Date(slotDate);
            startAt.setUTCHours(
                slot.startTime.getUTCHours(),
                slot.startTime.getUTCMinutes(),
                0,
                0,
            );

            const endAt = new Date(slotDate);
            endAt.setUTCHours(
                slot.endTime.getUTCHours(),
                slot.endTime.getUTCMinutes(),
                0,
                0,
            );

            // 3. Check if a schedule already exists for this slot
            const existing = await prisma.schedule.findFirst({
                where: {
                    activityId: activity.id,
                    startAt,
                },
            });

            if (existing) {
                skipped++;
                continue;
            }

            // 4. Create the schedule
            await prisma.schedule.create({
                data: {
                    activityId: activity.id,
                    startAt,
                    endAt,
                    status: ActivityStatus.ACTIVE,
                },
            });

            created++;
        }
    }

    console.log(`[cron] Done — ${created} schedules created, ${skipped} already existed.`);
}