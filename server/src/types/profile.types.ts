import {ScheduleDto, ActivityDto} from "./index.js";
import { Profile } from '../generated/prisma/index.js';

export type ProfileDto = Pick<Profile, 'profileName' | 'email' | 'role'> & {
    favorites: ActivityDto[],
    participations: ScheduleDto[]
}
