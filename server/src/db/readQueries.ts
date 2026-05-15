import {prisma} from "./prisma";
import { startAndEndOfWeek } from "../utils/weekCalculator";
import { ActivityTemplate, Profile } from "../generated/prisma";
import { ScheduleDto, ActivityDto } from '../types'
export class READ {
    /**
     * Purpose: returns the current schedule of the week
     * @return ScheduleDto[] --> {Schedule, activity: ActivityTemplate}[] ==> see anyWeekSchedule(date: Date) for more details
     */
    static async currentSchedule(): Promise<ScheduleDto[]> {
        const nowDate: Date = new Date(); // for next weeks query we could just add 7? for the week after +14? usw.
        return await this.anyWeekSchedule(nowDate)
    }


    /**
     * Given any date, it returns the weeks schedule of the week the date is in.
     * @param date any valid date
     * @return ScheduleDto[] --> {Schedule, activity: ActivityTemplate}[]
     *      **SUCCESS** --> array filled with ScheduleDto objects
     *      **FAIL** --> empty array
     */
    static async anyWeekSchedule(date: Date): Promise<ScheduleDto[]> {//: Promise<ScheduleDto[]>
        const { startDay, endDay } = startAndEndOfWeek(date);
        // PART B - QUERY
        // let schedule: Schedule;
        const schedule = await prisma.schedule.findMany({
            where: {
                AND: [
                    { startAt: { gte: startDay } },
                    { startAt: { lte: endDay } }
                ]
            },
            orderBy: {
                startAt: "asc"
            },
            include: {
                activity: {
                    include: {
                        leaders: {
                            select: {
                                profile: {
                                    select: {
                                       id: true,
                                       profileName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const formatSched: ScheduleDto[] = [];
        schedule.forEach( el => {
            let leader: any = el.activity.leaders ?? [];
            leader = Array.isArray(leader) ? leader.map((el: { profile: any; }) => el.profile) : [];
            (el.activity as any).leaders = undefined;
            formatSched.push({
                id: el.id,
                activityId: el.activityId,
                startAt: el.startAt,
                endAt: el.endAt,
                status: el.status,
                createdAt: el.createdAt,
                updatedAt: el.updatedAt,
                activity: el.activity,
                leaders: leader
            } satisfies ScheduleDto)
        })


        return formatSched;
    }

    
    static async anyDaySchedule(date: Date): Promise<any[]> {
        const startDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const endDay = new Date(Date.UTC(startDay.getUTCFullYear(), startDay.getUTCMonth(), startDay.getUTCDate() + 1));
        const schedule = await prisma.schedule.findMany({
            where: {
                startAt: {
                    gte: startDay,
                    lt: endDay
                },
            },
            orderBy: {
                startAt: "asc"
            },
            include: {
                activity: true
            }
        });
        return schedule;
    }


    /**
     * @param profileId --> requires to be logged-in, i.e. we need an account
     * @return Promise<ActivityTemplate[]>
     *     **FAIL**
     *     --> is empty if the profile doesn't have favorite activities
     *     **SUCCESS**
     *     --> array of ActivityTemplateModel objects
     */
    static async activitiesFavoritedBy(profileId: string): Promise<ActivityDto[]>
    {
        let favorites = await prisma.favorite.findMany({
            where: { profileId },
            select: {
                activity: {
                    include: {
                        leaders: true,
                        timeSlots: true
                    }
                }
            }
        })
        //unsure about the satisfies keyword here: satisfies ActivityDto[]
        return favorites.map( a => a.activity);
    }

    /**
     * If a user is found in the table, they participated in the activity.
     * @param scheduleId
     * @return (ParticipationLogModel & ProfileModel)[]
     *      **SUCCESS**
     *      --> Array of the participation log, including the profile
     *      **FAIL**
     *      --> empty array
     */
    static async participantsOf(scheduleId: string) {
        const participants = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            select: {
                participations: {
                    select: {
                        profile: true
                    }
                }
            }
        });
        return participants?.participations.map(el => el.profile);
    }

    // all activities updated after a given timestamp
    // static async activitiesUpdatedAfter(lastRequest: Date){}

    static async activityById(activityId: string): Promise<ActivityTemplate | null> {
        const activity = await prisma.activityTemplate.findUnique({
            where: { id: activityId }
        });
        return activity;
    }
    /**
     * just returns all activityTemplates
     */
    static async allActivities() {
        let activities = await prisma.activityTemplate.findMany({
            include: {
                timeSlots: true,
                leaders: true
            },
        });
        return activities;
    }


    /**
     * returns array of profiles that favorited the activity by id
     * --> change to activity name?
     * @param activityId
     */
    static async profilesFavorited(activityId: string): Promise<Profile[]>
    {
        const profilesFavorited = await prisma.activityTemplate.findUnique({
            where: {id: activityId},
            select: {
                favorites: {
                    select: {
                        profile: true
                    }
                }
            }
        })
        if(profilesFavorited) {
            return profilesFavorited.favorites.map(el => el.profile);
        } else{
            return [];
        }
    }
}
