import {prisma} from "./prisma";
import {ActivityTemplateModel} from '../generated/prisma/models'// ProfileModel, ScheduleModel
// import {postActivity} from "../types/activity.types";
/*
CREATE Queries
    create new profile
        adding favorites → use connect clause, cause the activities already exist
    create new activity
    add new time slot to an activity
    perhaps a query for attending activity, CREATE query for Participations (e.g., linking a profile_id to a time_slot_id). wdyt?
    add a new week to the schedule
 */


export default class CREATE{


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
}