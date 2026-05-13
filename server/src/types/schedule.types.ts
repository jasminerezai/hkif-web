import { Schedule, ActivityTemplate } from '../generated/prisma';
// import {Weekday, ActivityStatus} from '../db/prisma'

export type ScheduleDto = Schedule &{
    activity: ActivityTemplate
};