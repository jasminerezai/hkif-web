import { Activity } from "../types/activity.types";
import { prisma } from "./prisma";

export class CREATE {
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
}
