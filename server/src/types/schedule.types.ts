import { Schedule, ActivityTemplate } from '../generated/prisma/index.js';
import {leaderDto} from "./profile.types.js";

export type ScheduleDto = Schedule &{
    activity: ActivityTemplate,
    leaders: leaderDto[];
};