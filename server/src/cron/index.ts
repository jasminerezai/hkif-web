// server/src/cron/index.ts
//
// Sets up the cron job that generates schedules every Monday at 00:05.
// Also runs once on startup IF today is Monday, as a fallback in case
// the server was down at 00:05.

import cron from 'node-cron';
import { generateWeeklySchedules } from './scheduleGenerator.js';

export function initCronJobs(): void {
    // Weekly schedule generation
    // Runs every Monday at 00:05 server time.
    // '5 0 * * 1' = minute 5, hour 0, any day of month, any month, Monday (1)
    cron.schedule('5 0 * * 1', async () => {
        console.log('[cron] Running weekly schedule generation...');
        try {
            await generateWeeklySchedules();
        } catch (err) {
            console.error('[cron] Schedule generation failed:', err);
        }
    });

    // Startup fallback
    // Only runs if today is Monday — prevents double-inserting schedules
    // when the server restarts on the same day the cron already fired.
    const today = new Date();
    if (today.getDay() === 1) {
        console.log('[cron] Today is Monday — running startup schedule check...');
        generateWeeklySchedules().catch(err => {
            console.error('[cron] Startup schedule check failed:', err);
        });
    } else {
        console.log('[cron] Startup schedule check skipped (not Monday).');
    }

    console.log('[cron] Weekly schedule generation cron job registered (Monday 00:05).');
}