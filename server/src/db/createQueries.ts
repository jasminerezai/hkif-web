import {Activity, FavoriteCreateDelete, ActivityDto, ScheduleDto} from "../types/index.js";
import { prisma, ActivityStatus } from "./prisma.js";
import { ApiError } from "../utils/ApiError.js";
import {formatActivity, formatSchedule} from "./utils.js";
/*
CREATE Queries
    create new profile
        adding favorites → use connect clause, cause the activities already exist
    create new activity
    add new time slot to an activity
    perhaps a query for attending activity, CREATE query for Participations (e.g., linking a profile_id to a time_slot_id). wdyt?
    add a new week to the schedule
 */


export class CREATE {

    // adding favorites
    static async newFavorite(ids: FavoriteCreateDelete): Promise<ActivityDto> {
        const { activity } = await prisma.favorite.create({
            data: {
                profileId: ids.profileId,
                activityId: ids.activityId
            },
            select: {
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
                        },
                        timeSlots: true
                    }
                }
            }
        })
        return formatActivity(activity);
    }

    static async newActivity(newAct: Activity): Promise<ActivityDto> {
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
                        timeSlots: true,
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
                });
        return formatActivity(activity);
    }

    static async newSchedule(data: {
        activityId: string;
        startAt: Date;
        endAt?: Date | null;
        status?: ActivityStatus;
    }): Promise<ScheduleDto> {
        let finalStatus = data.status;

        if (!finalStatus) {
            const activity = await prisma.activityTemplate.findUnique({
                where: { id: data.activityId },
                select: { defaultStatus: true }
            });
            if (!activity) {
                throw ApiError.notFound('Activity not found');
            }
            finalStatus = activity.defaultStatus;
        }

        const schedule = await prisma.schedule.create({
            data: {
                activityId: data.activityId,
                startAt: data.startAt,
                endAt: data.endAt,
                status: finalStatus
            },
            include: {
                _count: {
                    select: { participations: true }
                },
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

        return formatSchedule(schedule);
    }

    static async registerParticipation(profileId: string, scheduleId: string, activityId: string): Promise<number> {
        return await prisma.$transaction(async (tx) => {
            // Check schedule exists and belongs to this activity
            const schedule = await tx.schedule.findUnique({
                where: { id: scheduleId },
                include: { activity: true }
            })
            if (!schedule) throw ApiError.notFound('Schedule not found')
            if (schedule.activityId !== activityId) throw ApiError.badRequest('Schedule does not belong to this activity')

            // Check capacity
            if (schedule.activity.maxCapacity !== null) {
                const count = await tx.participationLog.count({ where: { scheduleId } })
                if (count >= schedule.activity.maxCapacity) {
                    throw ApiError.conflict('Activity is full')
                }
            }

            // Check not already registered
            const existing = await tx.participationLog.findUnique({
                where: { profileId_scheduleId: { profileId, scheduleId } }
            })
            if (existing) throw ApiError.conflict('Already registered for this activity')

            await tx.participationLog.create({
                data: { profileId, scheduleId }
            })

            return await tx.participationLog.count({ where: { scheduleId } })
        })

    }
}
