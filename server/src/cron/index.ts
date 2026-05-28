// server/src/cron/index.ts
import cron from 'node-cron';
import { generateWeeklySchedules } from './scheduleGenerator.js';

export function initCronJobs(): void {
    // Weekly schedule generation
    // Runs every Monday at 00:05 — generates the next 2 weeks
    // so there's always a buffer even if startup hasn't run recently.
    cron.schedule('5 0 * * 1', async () => {
        console.log('[cron] Running weekly schedule generation...');
        try {
            await generateWeeklySchedules(2);
        } catch (err) {
            console.error('[cron] Schedule generation failed:', err);
        }
    });

    // Startup: generate 16 weeks ahead (~4 months) so the schedule
    // is always fully populated from day one, regardless of what day
    // the server starts on.
    console.log('[cron] Generating schedules for the next 16 weeks...');
    generateWeeklySchedules(16).catch(err => {
        console.error('[cron] Startup schedule generation failed:', err);
    });

    console.log('[cron] Weekly schedule generation cron job registered (Monday 00:05).');
}