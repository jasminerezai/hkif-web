import { prisma } from "./prisma";
import { Activity, TimeSlot } from "../types/activity.types";

export default class UPDATE {
    static async updateActivity(activityId: string, newData: Partial<Activity>) {
        // These fields require special handling, so we extract them from the update payload first  
        const timeSlots = newData.timeSlots;
        delete newData.timeSlots;

        const leaders = newData.leaders;
        delete newData.leaders;

        // Update general fields of the activity
        await prisma.activityTemplate.update({
            where: { id: activityId },
            // @ts-ignore - this is a bit hacky, but it allows us to only include fields that are actually being updated (excludes timeSlots and leaders)
            data: newData,
        });

        if (!!timeSlots) {
            await this.deleteAllTimeSlots(activityId);
            await this.addTimeSlots(activityId, timeSlots);
        }

        if (!!leaders) {
            await prisma.leaderActivity.deleteMany({
                where: { activityId }
            });
            await prisma.leaderActivity.createMany({
                data: leaders.map(profileId => ({
                    profileId,
                    activityId
                }))
            });
        }

        return prisma.activityTemplate.findUnique({
            where: { id: activityId },
            include: {
                leaders: true,
                timeSlots: true
            }
        });
    }

    static async addTimeSlots(activityId: string, newData: TimeSlot[]) {
        return prisma.activityTemplate.update({
            where: { id: activityId },
            data: {
                timeSlots: {
                    createMany: {
                        data: newData.map(el => ({
                            weekday: el.weekday,
                            startTime: new Date(`1970-01-01T${el.startAt}Z`),
                            endTime: new Date(`1970-01-01T${el.endAt}Z`)
                        }))
                    }
                }
            },
            include: {
                timeSlots: true
            }
        });
    }

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
}
