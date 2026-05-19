import {ScheduleDto} from "./schedule.types.js";
import {ActivityDto} from './activity.types.js'
import { Profile } from '../generated/prisma/index.js';

export type ProfileDto = Pick<Profile, 'profileName' | 'email' | 'role'> & {
    favorites: ActivityDto[],
    participations: ScheduleDto[]
}
