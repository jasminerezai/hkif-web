// server/src/cron/scheduleGenerator.ts
//
// Core logic for generating Schedule rows for the coming weeks.
// Called by the cron job every Monday at 00:05, and once on
// server startup to pre-populate the next 16 weeks (~4 months).

import { prisma, ActivityStatus } from '../db/prisma.js';
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

function nextDateForWeekday(base: Date, weekday: string): Date {
    const target = weekdayMap[weekday]!;
    const date = new Date(base);
    const diff = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);
    return date;
}

// generateWeeklySchedules
// Generates Schedule rows for one or more upcoming weeks.
//
// weeksAhead: how many weeks to generate (default 1 for cron, 16 for startup)
export async function generateWeeklySchedules(weeksAhead: number = 1): Promise<void> {
    const now = new Date();

    let totalCreated = 0;
    let totalSkipped = 0;

    // Fetch all active activity templates with their time slots once
    const activities = await prisma.activityTemplate.findMany({
        where: { defaultStatus: ActivityStatus.ACTIVE },
        include: { timeSlots: true },
    });

    for (let week = 1; week <= weeksAhead; week++) {
        const futureDate = nextWeek(now, week);
        const { startDay, endDay } = startAndEndOfWeek(futureDate);

        console.log(`[cron] Generating schedules for ${startDay.toDateString()} – ${endDay.toDateString()}`);

        let created = 0;
        let skipped = 0;

        for (const activity of activities) {
            for (const slot of activity.timeSlots) {

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

                const existing = await prisma.schedule.findFirst({
                    where: { activityId: activity.id, startAt, endAt },
                });

                if (existing) {
                    skipped++;
                    continue;
                }

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

        console.log(`[cron] Week ${week}/${weeksAhead} — ${created} created, ${skipped} skipped.`);
        totalCreated += created;
        totalSkipped += skipped;
    }

    console.log(`[cron] Total — ${totalCreated} schedules created, ${totalSkipped} already existed.`);
}