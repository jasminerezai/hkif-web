import { Schedule, ActivityTemplate } from '../generated/prisma/index.js';

export type ScheduleDto = Schedule &{
    activity: ActivityTemplate,
    leaders: {
        profileName: string,
        profileId: string,
    }[];
};