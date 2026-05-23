import {ScheduleDto} from "./schedule.types.js";
import {ActivityDto} from './activity.types.js'
import { ProfileRole } from '../db/prisma.js';

export type ProfileDto = {
    profileName: string | null,
    email: string,
    role: ProfileRole
    favorites: ActivityDto[],
    participations: ScheduleDto[]
}

export type leaderDto = {
    id: string,
    profileName: string | null
}


export type ProfileSummaryDto = {
    id: string,
    profileName: string | null,
    email: string,
    role: ProfileRole
};

