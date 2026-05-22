import {ScheduleDto} from "./schedule.types.js";
import {ActivityDto} from './activity.types.js'
import { Profile } from '../generated/prisma/index.js';

export type ProfileDto = Pick<Profile, 'profileName' | 'email' | 'role'> & {
    favorites: ActivityDto[],
    participations: ScheduleDto[]
}

export type leaderDto = {
    id: string,
    profileName: string | null
}
export type ProfileSummaryDto = Pick<Profile, 'id' | 'profileName' | 'email' | 'role'>;

