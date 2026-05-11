import { Activity } from "../types/activity.types";
import { prisma } from "./prisma";
import {ActivityTemplateModel} from '../generated/prisma/models'
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
    static async newFavorite(profileId: string, activityId: string): Promise<ActivityTemplateModel>
    {
        const {activity} = await prisma.favorite.create({
            data: {
                profileId,
                activityId
            },
            select: {
              activity: true
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
}
