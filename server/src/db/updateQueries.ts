import { prisma, ActivityStatus } from "./prisma.js";
import {Activity, ScheduleDto, ActivityDto, leaderDto} from "../types/index.js";
import {formatActivity, formatSchedule} from "./utils.js";
import {ApiError} from "../utils/ApiError.js";
import { TimeSlot } from '../generated/prisma/index.js';

export class UPDATE {
    /**
     * Updates an Activity.
     * @param activityId
     * @param newData Partial<Activity> --> where Activity is the type from activity.types.ts
     * @return ActivityDto --> THE ID FROM THE TIME SLOTS MAY BE AN EMPTY STRING (IF THE
     */
    static async updateActivity(activityId: string, newData: Partial<Activity>): Promise<ActivityDto> {
        // These fields require special handling, so we extract them from the update payload first  
        const slots = newData.timeSlots;
        delete newData.timeSlots;

        const leaders = newData.leaders;
        delete newData.leaders;
        // Update general fields of the activity
        const newAct = await prisma.$transaction( async (tx) => {
            const general = await tx.activityTemplate.update({
                where: {id: activityId},
                // @ts-ignore - this is a bit hacky, but it allows us to only include fields that are actually being updated (excludes timeSlots and leaders)
                data: newData,
            });
            let newLeaders: leaderDto[] = [];
            let newTimes: TimeSlot[] = [];
            if (!!slots) {
                await tx.timeSlot.deleteMany({
                    where: {activityId}
                });

                newTimes =  await tx.timeSlot.createManyAndReturn({
                    data: slots.map(el => ({
                        activityId,
                        weekday: el.weekday,
                        startTime: new Date(`1970-01-01T${el.startAt}Z`),
                        endTime: new Date(`1970-01-01T${el.endAt}Z`)
                    }))
                })
            }

            if (!!leaders) {
                    await tx.leaderActivity.deleteMany({
                        where: {activityId}
                    });
                    const tmp = await tx.leaderActivity.createManyAndReturn({
                        data: leaders.map(profileId => ({
                            profileId,
                            activityId
                        })),
                        select: {
                            profile: {
                                select: {
                                    id: true,
                                    profileName: true
                                }
                            }
                        }
                    });
                    tmp.map(p => newLeaders.push(p.profile));
            }

            return {
                ...general,
                leaders: newLeaders,
                timeSlots: newTimes
            } satisfies ActivityDto;
        })

        // do we still need this check?
        if (!newAct) throw ApiError.notFound(`Activity to update not Found`);
        else return formatActivity(newAct);
    }

    /**
     * adds an array of timeslots to an activity
     * Return value is currently not used
     * @param activityId
     * @param newData
     */
    static async addTimeSlots(activityId: string, newData: TimeSlot[]) {
        return prisma.activityTemplate.update({
            where: {id: activityId},
            data: {
                timeSlots: {
                    createMany: {
                        data: newData.map(el => ({
                            weekday: el.weekday,
                            startTime: new Date(`1970-01-01T${el.startTime}Z`),
                            endTime: new Date(`1970-01-01T${el.endTime}Z`)
                        }))
                    }
                }
            },
            include: {
                timeSlots: true
            }
        });
    }

    /**
     * Deletes all timeslots of a given activity
     * Return value is currently not used.
     * @param activityId
     */
    static async deleteAllTimeSlots(activityId: string) {
        return prisma.activityTemplate.update({
            where: { id: activityId },
            data: {
                timeSlots: {
                    deleteMany: {}
                }
            },
        });
    }


    /**
     * Updates a Schedules starting time, ending time. or/and their current status.
     * @param scheduleId string (uuid)
     * @param data {
     *         startAt?: Date;
     *         endAt?: Date | null;
     *         status?: ActivityStatus;
     *     }
     */
    static async updateSchedule(scheduleId: string, data: {
        startAt?: Date;
        endAt?: Date | null;
        status?: ActivityStatus;
    }): Promise<ScheduleDto> {
        const schedule = await prisma.schedule.update({
            where: { id: scheduleId },
            data,
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
}
