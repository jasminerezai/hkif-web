import { Activity, FavoriteCreateDelete, ActivityDto } from "../types/index.js";
import { prisma } from "./prisma.js";
import { ApiError } from "../utils/ApiError.js";
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
