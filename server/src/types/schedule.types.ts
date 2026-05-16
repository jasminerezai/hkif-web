import { Schedule, ActivityTemplate, Profile } from '../generated/prisma/index.js';
// import {Weekday, ActivityStatus} from '../db/prisma'

export type ScheduleDto = Schedule &{
    activity: ActivityTemplate,
    leaders: Pick<Profile, 'id' | 'profileName'>[]
};