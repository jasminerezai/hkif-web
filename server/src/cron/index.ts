// server/src/cron/index.ts
import cron from 'node-cron';
import { generateWeeklySchedules } from './scheduleGenerator.js';
import { cronLogger } from '../utils/logger.js';

export function initCronJobs(): void {
    // Weekly schedule generation
    // Runs every Monday at 00:05 — generates the next 2 weeks
    // so there's always a buffer even if startup hasn't run recently.
    cron.schedule('5 0 * * 1', async () => {
        cronLogger.info('Running weekly schedule generation...');
        try {
            await generateWeeklySchedules(2);
        } catch (err) {
            cronLogger.error('Schedule generation failed:', err);
        }
    });

    // Startup: generate 16 weeks ahead (~4 months) so the schedule
    // is always fully populated from day one, regardless of what day
    // the server starts on.
    cronLogger.info('Initiating startup schedule generation (16 weeks)...');
    generateWeeklySchedules(16)
        .then(() => {
            cronLogger.info('Startup schedule generation completed successfully.');
        })
        .catch(err => {
            cronLogger.error('Startup schedule generation failed:', err);
        });

    cronLogger.info('Weekly schedule generation cron job registered (Monday 00:05).');
}