import {Activity, FavoriteCreateDelete, ActivityDto, ScheduleDto} from "../types/index.js";
import { prisma, ActivityStatus } from "./prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { formatActivity, formatSchedule } from "./utils.js";
import { nextDateForWeekday } from "../utils/weekCalculator.js";

export class CREATE {

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
        const activity = await prisma.$transaction(async (tx) => {

            // Create the activity template with leaders and time slots
            const created = await tx.activityTemplate.create({
                data: {
                    name: newAct.name,
                    location: newAct.location,
                    description: newAct.description,
                    notes: newAct.notes,
                    defaultStatus: newAct.defaultStatus,
                    maxCapacity: newAct.maxCapacity,
                    leaders: {
                        createMany: {
                            data: newAct.leaders.map((profileId) => ({ profileId }))
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

            // Generate Schedule rows for current + next 2 weeks
            const today = new Date();
            const todayDow = today.getUTCDay();
            const monday = new Date(today);
            monday.setUTCDate(today.getUTCDate() - ((todayDow + 6) % 7));

            const scheduleData = [];

            for (const slot of created.timeSlots) {
                for (let week = 0; week < 3; week++) {
                    const base = new Date(monday);
                    base.setUTCDate(monday.getUTCDate() + week * 7);

                    const date = nextDateForWeekday(base, slot.weekday);

                    const start = new Date(date);
                    start.setUTCHours(
                        slot.startTime.getUTCHours(),
                        slot.startTime.getUTCMinutes(),
                        0, 0
                    );

                    const end = new Date(date);
                    end.setUTCHours(
                        slot.endTime.getUTCHours(),
                        slot.endTime.getUTCMinutes(),
                        0, 0
                    );

                    scheduleData.push({
                        activityId: created.id,
                        startAt: start,
                        endAt: end,
                        status: created.defaultStatus,
                    });
                }
            }

            await tx.schedule.createMany({ data: scheduleData, skipDuplicates: true });
            return created;
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
            const schedule = await tx.schedule.findUnique({
                where: { id: scheduleId },
                include: { activity: true }
            })
            if (!schedule) throw ApiError.notFound('Schedule not found')
            if (schedule.activityId !== activityId) throw ApiError.badRequest('Schedule does not belong to this activity')

            const now = Date.now()
            if ( schedule.startAt.getTime() < now   ) throw ApiError.badRequest(`The event is in the Past`)
            if( schedule.endAt && schedule.endAt.getTime() < now){
                throw ApiError.badRequest(`The event is in the Past`)
            }
            if ( !schedule.endAt ) {
                //default end time is two hours after the start time
                const defaultEnd = new Date(schedule.startAt).setUTCHours(schedule.startAt.getUTCHours() + 2 )
                if(defaultEnd < now) throw ApiError.badRequest(`The event is in the Past`)
            }

            if (schedule.activity.maxCapacity !== null) {
                const count = await tx.participationLog.count({ where: { scheduleId } })
                if (count >= schedule.activity.maxCapacity) {
                    throw ApiError.conflict('Activity is full')
                }
            }

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