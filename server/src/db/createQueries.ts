import {Activity, FavoriteCreateDelete, ActivityDto, ScheduleDto} from "../types/index.js";
import { prisma, ActivityStatus } from "./prisma.js";
/*
CREATE Queries
    create new profile
        adding favorites → use connect clause, cause the activities already exist
    create new activity
    add new time slot to an activity
    perhaps a query for attending activity, CREATE query for Participations (e.g., linking a profile_id to a time_slot_id). wdyt?
    add a new week to the schedule
 */


export class CREATE{

    // adding favorites
    static async newFavorite(ids: FavoriteCreateDelete): Promise<ActivityDto>{
        const {activity} = await prisma.favorite.create({
            data: {
                profileId: ids.profileId,
                activityId: ids.activityId
            },
            select: {
                activity: {
                    include: {
                        leaders: true,
                        timeSlots: true
                    }
                }
            }
        })
        return activity;
    }

    static async newActivity(newAct: Activity) {
        const activity = await prisma.activityTemplate.create({
            data: {
                name: newAct.name,
                location: newAct.location,
                description: newAct.description,
                notes: newAct.notes,
                defaultStatus: newAct.defaultStatus,
                maxCapacity: newAct.maxCapacity,
                leaders: {
                    createMany: {
                        data: newAct.leaders.map((profileId) => ({
                            profileId
                        }))
                    }
                },
                timeSlots: {
                    createMany: {
                        data: newAct.timeSlots.map(el => ({
                            weekday: el.weekday,
                            startTime: new Date(`1970-01-01T${el.startAt}Z`),
                            endTime: new Date(`1970-01-01T${el.endAt}Z`)
                        }))
                    }
                },
            },
            include: {
                leaders: true,
                timeSlots: true
            }
        });
        return activity;
    }

    static async newSchedule(data: {
        activityId: string;
        startAt: Date;
        endAt?: Date | null;
        status: ActivityStatus;
    }): Promise<ScheduleDto> {
        const schedule = await prisma.schedule.create({
            data,
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

        let leaders: any = schedule.activity.leaders ?? [];
        leaders = Array.isArray(leaders) ? leaders.map((el: { profile: any; }) => el.profile) : [];
        (schedule.activity as any).leaders = undefined;

        return {
            id: schedule.id,
            activityId: schedule.activityId,
            startAt: schedule.startAt,
            endAt: schedule.endAt,
            status: schedule.status,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
            activity: schedule.activity,
            leaders
        } satisfies ScheduleDto;
    }
}
