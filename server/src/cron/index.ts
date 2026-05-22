// server/src/cron/index.ts
//
// Sets up the cron job that generates schedules every Monday at 00:01.
// Also runs once on startup as a fallback in case the server was down
// on Monday morning.

import cron from 'node-cron';
import { generateWeeklySchedules } from './scheduleGenerator.js';

export function initCronJobs(): void {
    // Weekly schedule generation
    // Runs every Monday at 00:01 server time.
    // '1 0 * * 1' = minute 1, hour 0, any day of month, any month, Monday (1)
    cron.schedule('1 0 * * 1', async () => {
        console.log('[cron] Running weekly schedule generation...');
        try {
            await generateWeeklySchedules();
        } catch (err) {
            console.error('[cron] Schedule generation failed:', err);
        }
    });

    // Startup fallback
    // Runs once when the server starts. Safe to call anytime —
    // generateWeeklySchedules() checks for existing schedules
    // before creating new ones, so no duplicates are possible.
    console.log('[cron] Running startup schedule check...');
    generateWeeklySchedules().catch(err => {
        console.error('[cron] Startup schedule check failed:', err);
    });

    console.log('[cron] Weekly schedule generation cron job registered (Monday 00:01).');
}